import { db } from '@/db';
import { proofOfDelivery } from '@/db/schema';

async function main() {
    const legalAgreementText = `DELIVERY CONFIRMATION AND ACCEPTANCE AGREEMENT

This Delivery Confirmation and Acceptance Agreement ("Agreement") is entered into as of the date of signature below between the Buyer and FarmLink Platform.

1. DELIVERY CONFIRMATION
By signing this document, I, the Buyer, hereby confirm that:
a) I have received the agricultural products as described in Order
b) The products have been delivered to the address specified in my order
c) I have inspected the products upon delivery
d) The quantity and quality of products match my order specifications

2. ACCEPTANCE OF GOODS
I acknowledge and confirm that:
a) The products delivered are in acceptable condition
b) Any discrepancies or quality issues have been noted and reported
c) I accept responsibility for the products from the time of delivery
d) Photographic evidence of the delivery has been captured and stored

3. PAYMENT RELEASE AUTHORIZATION
By confirming this delivery, I authorize FarmLink to:
a) Release payment from escrow to the Seller
b) Process the transaction completion
c) Finalize all financial settlements related to this order

4. DISPUTE RESOLUTION
I understand that:
a) Any disputes must be raised within 24 hours of delivery
b) Disputes will be handled according to FarmLink's dispute resolution policy
c) After confirmation, disputes may not be accepted unless proven fraud

5. DATA COLLECTION AND STORAGE
I consent to FarmLink collecting and storing:
a) My digital signature
b) Photographs of the delivered products
c) My feedback and comments about the delivery
d) Delivery location and timestamp information
e) IP address and device information for security purposes

6. LEGAL BINDING
This confirmation serves as a legally binding acceptance of the delivered goods and authorizes the release of payment to the Seller.

By signing below, I acknowledge that I have read, understood, and agree to all terms stated in this Agreement.`;

    const sampleProofs = [
        {
            deliveryTaskId: 1,
            orderId: 1,
            buyerSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            deliveryPhotos: '["https://farmlink-assets.s3.amazonaws.com/delivery-photos/del-1-photo-1.jpg", "https://farmlink-assets.s3.amazonaws.com/delivery-photos/del-1-photo-2.jpg"]',
            buyerConfirmation: 1,
            buyerFeedback: 'Excellent quality tomatoes, delivered fresh and on time. Very satisfied with the service.',
            legalAgreementAccepted: 1,
            legalAgreementVersion: '1.0',
            legalAgreementText: legalAgreementText,
            agreementAcceptedAt: new Date('2024-02-15T14:30:00Z').toISOString(),
            ipAddress: '105.112.45.89',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            createdAt: new Date('2024-02-15T14:30:00Z').toISOString(),
        },
        {
            deliveryTaskId: 2,
            orderId: 2,
            buyerSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
            deliveryPhotos: '["https://farmlink-assets.s3.amazonaws.com/delivery-photos/del-2-photo-1.jpg", "https://farmlink-assets.s3.amazonaws.com/delivery-photos/del-2-photo-2.jpg", "https://farmlink-assets.s3.amazonaws.com/delivery-photos/del-2-photo-3.jpg"]',
            buyerConfirmation: 1,
            buyerFeedback: 'Good quality rice, packaging was secure. Delivery was prompt and driver was professional.',
            legalAgreementAccepted: 1,
            legalAgreementVersion: '1.0',
            legalAgreementText: legalAgreementText,
            agreementAcceptedAt: new Date('2024-02-16T10:15:00Z').toISOString(),
            ipAddress: '197.210.70.45',
            userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36',
            createdAt: new Date('2024-02-16T10:15:00Z').toISOString(),
        },
        {
            deliveryTaskId: 7,
            orderId: 7,
            buyerSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            deliveryPhotos: '["https://farmlink-assets.s3.amazonaws.com/delivery-photos/del-7-photo-1.jpg", "https://farmlink-assets.s3.amazonaws.com/delivery-photos/del-7-photo-2.jpg"]',
            buyerConfirmation: 0,
            buyerFeedback: 'Some of the yams were spoiled. Not what I expected based on the product listing. Disappointed with quality.',
            legalAgreementAccepted: 1,
            legalAgreementVersion: '1.0',
            legalAgreementText: legalAgreementText,
            agreementAcceptedAt: new Date('2024-02-21T16:45:00Z').toISOString(),
            ipAddress: '105.112.98.34',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            createdAt: new Date('2024-02-21T16:45:00Z').toISOString(),
        },
        {
            deliveryTaskId: 8,
            orderId: 8,
            buyerSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
            deliveryPhotos: '["https://farmlink-assets.s3.amazonaws.com/delivery-photos/del-8-photo-1.jpg"]',
            buyerConfirmation: 1,
            buyerFeedback: 'Great cassava, fresh and exactly as described. Will order again from this seller.',
            legalAgreementAccepted: 1,
            legalAgreementVersion: '1.0',
            legalAgreementText: legalAgreementText,
            agreementAcceptedAt: new Date('2024-02-22T09:20:00Z').toISOString(),
            ipAddress: '197.210.52.120',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            createdAt: new Date('2024-02-22T09:20:00Z').toISOString(),
        },
        {
            deliveryTaskId: 9,
            orderId: 9,
            buyerSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKQAAAABJRU5ErkJggg==',
            deliveryPhotos: '["https://farmlink-assets.s3.amazonaws.com/delivery-photos/del-9-photo-1.jpg", "https://farmlink-assets.s3.amazonaws.com/delivery-photos/del-9-photo-2.jpg"]',
            buyerConfirmation: 1,
            buyerFeedback: 'Perfect onions, good size and quality. Delivery was smooth and on schedule.',
            legalAgreementAccepted: 1,
            legalAgreementVersion: '1.0',
            legalAgreementText: legalAgreementText,
            agreementAcceptedAt: new Date('2024-02-23T11:40:00Z').toISOString(),
            ipAddress: '105.112.77.156',
            userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            createdAt: new Date('2024-02-23T11:40:00Z').toISOString(),
        },
        {
            deliveryTaskId: 10,
            orderId: 10,
            buyerSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwABBAEAW9EJRAAAAABJRU5ErkJggg==',
            deliveryPhotos: '["https://farmlink-assets.s3.amazonaws.com/delivery-photos/del-10-photo-1.jpg", "https://farmlink-assets.s3.amazonaws.com/delivery-photos/del-10-photo-2.jpg", "https://farmlink-assets.s3.amazonaws.com/delivery-photos/del-10-photo-3.jpg"]',
            buyerConfirmation: 1,
            buyerFeedback: 'Excellent maize, fresh and properly packaged. Very happy with the entire transaction and delivery process.',
            legalAgreementAccepted: 1,
            legalAgreementVersion: '1.0',
            legalAgreementText: legalAgreementText,
            agreementAcceptedAt: new Date('2024-02-24T15:10:00Z').toISOString(),
            ipAddress: '197.210.226.89',
            userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36',
            createdAt: new Date('2024-02-24T15:10:00Z').toISOString(),
        },
    ];

    await db.insert(proofOfDelivery).values(sampleProofs);
    
    console.log('✅ Proof of delivery seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});