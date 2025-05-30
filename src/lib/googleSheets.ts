import { google } from 'googleapis';

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export interface MarkData {
  studentName: string;
  admissionNumber: string;
  class: string;
  subject: string;
  ce: number;
  te: number;
  total: number;
  result: 'Pass' | 'Fail';
  submittedAt: string;
}

export async function appendToSheet(data: MarkData) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error('Google Sheets spreadsheet ID not configured');
    }

    // Format data for sheets
    const values = [
      [
        data.studentName,
        data.admissionNumber,
        data.class,
        data.subject,
        data.ce,
        data.te,
        data.total,
        data.result,
        data.submittedAt
      ]
    ];

    // Append data to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Marks!A:I', // Assumes sheet name is "Marks"
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    throw error;
  }
}

// Function to create/setup the initial sheet structure
export async function setupSheet() {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error('Google Sheets spreadsheet ID not configured');
    }

    // Set up headers
    const headers = [
      ['Student Name', 'Admission Number', 'Class', 'Subject', 'CE', 'TE', 'Total', 'Result', 'Submitted At']
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Marks!A1:I1',
      valueInputOption: 'RAW',
      requestBody: {
        values: headers,
      },
    });

    // Format header row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 9,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 9,
              },
            },
          },
        ],
      },
    });

    return true;
  } catch (error) {
    console.error('Error setting up Google Sheet:', error);
    throw error;
  }
} 