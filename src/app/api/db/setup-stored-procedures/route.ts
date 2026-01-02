import { NextRequest, NextResponse } from 'next/server';
import { poolConnection } from '@/db';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Read the stored procedures SQL file
    const sqlFilePath = path.join(process.cwd(), 'database', 'stored-procedures.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the entire stored procedures file
    // MySQL will handle the DELIMITER changes automatically
    await poolConnection.query(sqlContent);

    // Verify stored procedures were created
    const [procedureRows]: any = await poolConnection.query(
      "SELECT ROUTINE_NAME FROM information_schema.routines WHERE routine_schema = DATABASE() AND routine_type = 'PROCEDURE' ORDER BY ROUTINE_NAME"
    );

    const procedures = procedureRows.map((row: any) => row.ROUTINE_NAME);

    return NextResponse.json({
      success: true,
      message: 'Stored procedures setup completed successfully',
      proceduresCreated: procedures.length,
      procedures: procedures,
    });

  } catch (error: any) {
    console.error('Stored procedures setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to set up stored procedures',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
