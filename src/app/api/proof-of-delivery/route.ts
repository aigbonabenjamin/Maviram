import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { proofOfDelivery } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

const DEFAULT_LEGAL_AGREEMENT = "By accepting this delivery, I confirm that I have received the product(s) in satisfactory condition. I acknowledge that Maviram Food Delivery is not responsible for any issues with the product(s) after I have accepted and signed for this delivery. This acceptance serves as proof of successful delivery and release of liability to Maviram Food Delivery.";
const DEFAULT_AGREEMENT_VERSION = "1.0";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const deliveryTaskId = searchParams.get('deliveryTaskId');
    const orderId = searchParams.get('orderId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get single proof by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const result = await db.execute(sql`
        SELECT * FROM proof_of_delivery WHERE id = ${parseInt(id)} LIMIT 1
      `);
      const proofs = Array.isArray(result) && result.length > 0 ? result[0] : [];
      
      if (!Array.isArray(proofs) || proofs.length === 0) {
        return NextResponse.json({ 
          error: 'Proof of delivery not found',
          code: 'POD_NOT_FOUND' 
        }, { status: 404 });
      }

      const proof = proofs[0];
      
      // Parse JSON fields
      if (proof.delivery_photos && typeof proof.delivery_photos === 'string') {
        try {
          proof.delivery_photos = JSON.parse(proof.delivery_photos);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }

      return NextResponse.json(proof, { status: 200 });
    }

    // Get proof by delivery task ID
    if (deliveryTaskId) {
      if (isNaN(parseInt(deliveryTaskId))) {
        return NextResponse.json({ 
          error: "Valid delivery task ID is required",
          code: "INVALID_DELIVERY_TASK_ID" 
        }, { status: 400 });
      }

      const result = await db.execute(sql`
        SELECT * FROM proof_of_delivery 
        WHERE delivery_task_id = ${parseInt(deliveryTaskId)}
        ORDER BY created_at DESC
      `);
      const proofs = Array.isArray(result) && result.length > 0 ? result[0] : [];
      
      const proofsArray = Array.isArray(proofs) ? proofs : [];
      
      // Parse deliveryPhotos for each proof
      proofsArray.forEach((proof: any) => {
        if (proof.delivery_photos && typeof proof.delivery_photos === 'string') {
          try {
            proof.delivery_photos = JSON.parse(proof.delivery_photos);
          } catch (e) {
            // Keep as string if parsing fails
          }
        }
      });

      return NextResponse.json(proofsArray, { status: 200 });
    }

    // Get proofs by order ID
    if (orderId) {
      if (isNaN(parseInt(orderId))) {
        return NextResponse.json({ 
          error: "Valid order ID is required",
          code: "INVALID_ORDER_ID" 
        }, { status: 400 });
      }

      const result = await db.execute(sql`
        SELECT * FROM proof_of_delivery 
        WHERE order_id = ${parseInt(orderId)}
        ORDER BY created_at DESC
      `);
      const proofs = Array.isArray(result) && result.length > 0 ? result[0] : [];
      
      const proofsArray = Array.isArray(proofs) ? proofs : [];
      
      // Parse deliveryPhotos for each proof
      proofsArray.forEach((proof: any) => {
        if (proof.delivery_photos && typeof proof.delivery_photos === 'string') {
          try {
            proof.delivery_photos = JSON.parse(proof.delivery_photos);
          } catch (e) {
            // Keep as string if parsing fails
          }
        }
      });

      return NextResponse.json(proofsArray, { status: 200 });
    }

    // Get all proofs with pagination
    const result = await db.execute(sql`
      SELECT * FROM proof_of_delivery 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `);
    const allProofs = Array.isArray(result) && result.length > 0 ? result[0] : [];

    // Parse deliveryPhotos for each proof
    if (Array.isArray(allProofs)) {
      allProofs.forEach((proof: any) => {
        if (proof.delivery_photos && typeof proof.delivery_photos === 'string') {
          try {
            proof.delivery_photos = JSON.parse(proof.delivery_photos);
          } catch (e) {
            // Keep as string if parsing fails
          }
        }
      });
    }

    return NextResponse.json(allProofs, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      deliveryTaskId, 
      orderId, 
      buyerSignature, 
      deliveryPhotos, 
      buyerConfirmation, 
      buyerFeedback,
      legalAgreementAccepted,
      legalAgreementVersion,
      legalAgreementText,
      agreementAcceptedAt,
      ipAddress,
      userAgent
    } = body;

    // Validate required fields
    if (!deliveryTaskId || typeof deliveryTaskId !== 'number') {
      return NextResponse.json({ 
        error: "Delivery task ID is required and must be a number",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!orderId || typeof orderId !== 'number') {
      return NextResponse.json({ 
        error: "Order ID is required and must be a number",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!buyerSignature || typeof buyerSignature !== 'string') {
      return NextResponse.json({ 
        error: "Buyer signature is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!deliveryPhotos) {
      return NextResponse.json({ 
        error: "Delivery photos are required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (buyerConfirmation === undefined || buyerConfirmation === null) {
      return NextResponse.json({ 
        error: "Buyer confirmation is required (0 or 1)",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (![0, 1].includes(buyerConfirmation)) {
      return NextResponse.json({ 
        error: "Buyer confirmation must be 0 or 1",
        code: "INVALID_BUYER_CONFIRMATION" 
      }, { status: 400 });
    }

    // Validate legal agreement fields
    if (legalAgreementAccepted === undefined || legalAgreementAccepted === null) {
      return NextResponse.json({ 
        error: "Legal agreement acceptance is required (0 or 1)",
        code: "MISSING_LEGAL_AGREEMENT_ACCEPTANCE" 
      }, { status: 400 });
    }

    if (![0, 1].includes(legalAgreementAccepted)) {
      return NextResponse.json({ 
        error: "Legal agreement acceptance must be 0 or 1",
        code: "INVALID_LEGAL_AGREEMENT_ACCEPTANCE" 
      }, { status: 400 });
    }

    // Convert deliveryPhotos to JSON string if it's an array
    let deliveryPhotosJSON: string;
    if (Array.isArray(deliveryPhotos)) {
      deliveryPhotosJSON = JSON.stringify(deliveryPhotos);
    } else if (typeof deliveryPhotos === 'string') {
      // Validate it's valid JSON
      try {
        JSON.parse(deliveryPhotos);
        deliveryPhotosJSON = deliveryPhotos;
      } catch (e) {
        return NextResponse.json({ 
          error: "Delivery photos must be a valid JSON array",
          code: "INVALID_DELIVERY_PHOTOS" 
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({ 
        error: "Delivery photos must be an array or JSON string",
        code: "INVALID_DELIVERY_PHOTOS" 
      }, { status: 400 });
    }

    const buyerFeedbackValue = buyerFeedback || null;
    
    // Set default values for legal agreement fields
    const finalLegalAgreementText = legalAgreementText || DEFAULT_LEGAL_AGREEMENT;
    const finalLegalAgreementVersion = legalAgreementVersion || DEFAULT_AGREEMENT_VERSION;
    const finalAgreementAcceptedAt = agreementAcceptedAt || new Date().toISOString();
    
    // Get IP address from request headers if not provided
    const finalIpAddress = ipAddress || 
      request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      null;
    
    // Get user agent from request headers if not provided
    const finalUserAgent = userAgent || request.headers.get('user-agent') || null;

    // Insert directly using raw SQL for MySQL compatibility
    await db.execute(sql`
      INSERT INTO proof_of_delivery (
        delivery_task_id, order_id, buyer_signature, delivery_photos,
        buyer_confirmation, buyer_feedback, legal_agreement_accepted,
        legal_agreement_version, legal_agreement_text, agreement_accepted_at,
        ip_address, user_agent, created_at
      ) VALUES (
        ${deliveryTaskId}, ${orderId}, ${buyerSignature}, ${deliveryPhotosJSON},
        ${buyerConfirmation}, ${buyerFeedbackValue}, ${legalAgreementAccepted},
        ${finalLegalAgreementVersion}, ${finalLegalAgreementText}, ${finalAgreementAcceptedAt},
        ${finalIpAddress}, ${finalUserAgent}, NOW()
      )
    `);

    // Retrieve the created proof
    const result = await db.execute(sql`
      SELECT * FROM proof_of_delivery WHERE id = LAST_INSERT_ID()
    `);

    const createdProofData = Array.isArray(result) && result.length > 0 ? result[0] : [];
    const createdProof = Array.isArray(createdProofData) && createdProofData.length > 0 ? createdProofData[0] : null;

    if (!createdProof) {
      return NextResponse.json({ 
        error: 'Failed to create proof of delivery' 
      }, { status: 500 });
    }

    // Parse deliveryPhotos for response
    if (createdProof.delivery_photos && typeof createdProof.delivery_photos === 'string') {
      try {
        createdProof.delivery_photos = JSON.parse(createdProof.delivery_photos);
      } catch (e) {
        // Keep as string if parsing fails
      }
    }

    return NextResponse.json(createdProof, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const proofId = parseInt(id);

    // Check if proof exists
    const existingResult = await db.execute(sql`
      SELECT * FROM proof_of_delivery WHERE id = ${proofId} LIMIT 1
    `);
    const existingProofs = Array.isArray(existingResult) && existingResult.length > 0 ? existingResult[0] : [];
    
    if (!Array.isArray(existingProofs) || existingProofs.length === 0) {
      return NextResponse.json({ 
        error: 'Proof of delivery not found',
        code: 'POD_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { 
      buyerSignature, 
      deliveryPhotos, 
      buyerConfirmation, 
      buyerFeedback,
      legalAgreementAccepted,
      legalAgreementVersion,
      legalAgreementText,
      agreementAcceptedAt,
      ipAddress,
      userAgent
    } = body;

    // Validate at least one field is provided
    if (!buyerSignature && !deliveryPhotos && buyerConfirmation === undefined && 
        buyerFeedback === undefined && legalAgreementAccepted === undefined &&
        legalAgreementVersion === undefined && legalAgreementText === undefined &&
        agreementAcceptedAt === undefined && ipAddress === undefined && userAgent === undefined) {
      return NextResponse.json({ 
        error: "At least one field must be provided for update",
        code: "NO_UPDATE_FIELDS" 
      }, { status: 400 });
    }

    // Validate buyerConfirmation if provided
    if (buyerConfirmation !== undefined && ![0, 1].includes(buyerConfirmation)) {
      return NextResponse.json({ 
        error: "Buyer confirmation must be 0 or 1",
        code: "INVALID_BUYER_CONFIRMATION" 
      }, { status: 400 });
    }

    // Validate legalAgreementAccepted if provided
    if (legalAgreementAccepted !== undefined && ![0, 1].includes(legalAgreementAccepted)) {
      return NextResponse.json({ 
        error: "Legal agreement acceptance must be 0 or 1",
        code: "INVALID_LEGAL_AGREEMENT_ACCEPTANCE" 
      }, { status: 400 });
    }

    // Convert deliveryPhotos to JSON string if provided
    let deliveryPhotosJSON: string | undefined;
    if (deliveryPhotos !== undefined) {
      if (Array.isArray(deliveryPhotos)) {
        deliveryPhotosJSON = JSON.stringify(deliveryPhotos);
      } else if (typeof deliveryPhotos === 'string') {
        try {
          JSON.parse(deliveryPhotos);
          deliveryPhotosJSON = deliveryPhotos;
        } catch (e) {
          return NextResponse.json({ 
            error: "Delivery photos must be a valid JSON array",
            code: "INVALID_DELIVERY_PHOTOS" 
          }, { status: 400 });
        }
      } else {
        return NextResponse.json({ 
          error: "Delivery photos must be an array or JSON string",
          code: "INVALID_DELIVERY_PHOTOS" 
        }, { status: 400 });
      }
    }

    // Build update SET clause dynamically
    const updateParts = [];
    const updateValues: any[] = [];

    if (buyerSignature !== undefined) {
      updateParts.push('buyer_signature = ?');
      updateValues.push(buyerSignature);
    }
    if (deliveryPhotosJSON !== undefined) {
      updateParts.push('delivery_photos = ?');
      updateValues.push(deliveryPhotosJSON);
    }
    if (buyerConfirmation !== undefined) {
      updateParts.push('buyer_confirmation = ?');
      updateValues.push(buyerConfirmation);
    }
    if (buyerFeedback !== undefined) {
      updateParts.push('buyer_feedback = ?');
      updateValues.push(buyerFeedback);
    }
    if (legalAgreementAccepted !== undefined) {
      updateParts.push('legal_agreement_accepted = ?');
      updateValues.push(legalAgreementAccepted);
    }
    if (legalAgreementVersion !== undefined) {
      updateParts.push('legal_agreement_version = ?');
      updateValues.push(legalAgreementVersion);
    }
    if (legalAgreementText !== undefined) {
      updateParts.push('legal_agreement_text = ?');
      updateValues.push(legalAgreementText);
    }
    if (agreementAcceptedAt !== undefined) {
      updateParts.push('agreement_accepted_at = ?');
      updateValues.push(agreementAcceptedAt);
    }
    if (ipAddress !== undefined) {
      updateParts.push('ip_address = ?');
      updateValues.push(ipAddress);
    }
    if (userAgent !== undefined) {
      updateParts.push('user_agent = ?');
      updateValues.push(userAgent);
    }

    // Add the ID for WHERE clause
    updateValues.push(proofId);

    // Execute update
    await db.execute(sql.raw(
      `UPDATE proof_of_delivery SET ${updateParts.join(', ')} WHERE id = ?`,
      updateValues
    ));

    // Retrieve updated proof
    const updatedResult = await db.execute(sql`
      SELECT * FROM proof_of_delivery WHERE id = ${proofId} LIMIT 1
    `);
    const updatedProofs = Array.isArray(updatedResult) && updatedResult.length > 0 ? updatedResult[0] : [];
    const updatedProof = Array.isArray(updatedProofs) && updatedProofs.length > 0 ? updatedProofs[0] : null;

    if (!updatedProof) {
      return NextResponse.json({ 
        error: 'Failed to update proof of delivery',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    // Parse deliveryPhotos for response
    if (updatedProof.delivery_photos && typeof updatedProof.delivery_photos === 'string') {
      try {
        updatedProof.delivery_photos = JSON.parse(updatedProof.delivery_photos);
      } catch (e) {
        // Keep as string if parsing fails
      }
    }

    return NextResponse.json(updatedProof, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const proofId = parseInt(id);

    // Check if proof exists
    const existingResult = await db.execute(sql`
      SELECT * FROM proof_of_delivery WHERE id = ${proofId} LIMIT 1
    `);
    const existingProofs = Array.isArray(existingResult) && existingResult.length > 0 ? existingResult[0] : [];
    
    if (!Array.isArray(existingProofs) || existingProofs.length === 0) {
      return NextResponse.json({ 
        error: 'Proof of delivery not found',
        code: 'POD_NOT_FOUND' 
      }, { status: 404 });
    }

    const proofToDelete = existingProofs[0];

    // Delete the proof
    await db.execute(sql`DELETE FROM proof_of_delivery WHERE id = ${proofId}`);

    // Parse deliveryPhotos for response
    if (proofToDelete.delivery_photos && typeof proofToDelete.delivery_photos === 'string') {
      try {
        proofToDelete.delivery_photos = JSON.parse(proofToDelete.delivery_photos);
      } catch (e) {
        // Keep as string if parsing fails
      }
    }

    return NextResponse.json({
      message: 'Proof of delivery deleted successfully',
      deletedProof: proofToDelete
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}