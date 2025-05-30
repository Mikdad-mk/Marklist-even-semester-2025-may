import { google } from 'googleapis';

const credentials = {
  client_email: "spreadsheet@marklist-evensemester-2025-may.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCCbylNPXwH/O5m\nSbPaGNTXPAkdm2EAXzoSQzm0iupX1OMNtr04EYv7tw4xNgrwV243/0foHbqBpD0Y\ngyXixAIO4Jk4YYRVm04TtgcbDz3vorCHKD/htEGePxDFlqPvtxVdonAb+fktoWJo\npwAZ5BofcYdrHdo/tsQYygy7e0fRzvQAwZviI4WQLEF1M9k7+2C+jdCAGheUj2IV\n980WJnv+UeVTh+/eJrxceG1lk4b+4UKNpENUVsJr9QWBW/V79nZKcG68aKchL+J+\njIi5B1FcgBOuPYwFhKH4WyVt30dXol8HxEN5bSzP48QEOkqPTfcj44R5lRF8SFzI\nb1uyXUyxAgMBAAECggEACnHsqqfrbmfTrvsEtSjDJZPEDpwGW+1kRPlfbfzoWH1+\nq7bYJvznuvHtJ+VyIY480CzoFRdJW8+bSWLaNjM4T3juqChN/L19toAfiEwTi4S5\nkm83k2NYFFwsQ4hlSyFcC4YiKGlfigcIDoWeEVS1/1Hb9Gjc9Ph1sl7+v0Y3aX6G\nAQTvyFMF3TbAV6+YHwu6yPsOkmkmQZNPolHtyOdZq5/+UPneNeniL1jZJVYuaL6h\nl78jNhqyN1c06mM7WvEul+gHPTyh6pZwBmw3wTFcJQRVqaIwNFNiGdJqCM2gFHcR\nPYwf7fNjQsPx3Bkp2mJrxnHJhOhxgggMPJz8SYD1CQKBgQC3/dAniyN77+HtLSUF\nCaQx+twOD3lDeKepGI31+GsZBi4qLcLW74xJYURVRw8W/g5bu2Cny/z7iWssq35X\nMZOboAaoKwikUuu19jRbZFdLYvmYXlNX26YI9oTQcMa1yXc5NAB3oZZ6DOFYknEQ\nph/n/NJ4+zffpQXowVUNIB6RGQKBgQC1e2zHO9I+L76lmYQx/IH1TFhc3VvXIOIr\nexP+6oHROVZcWj3K8D66HVp+/3vb0LN4pzFiaZTgLmmRJkutUXzh3lbE3a8yXGXp\nW6tFJUS8K+c260QX+wl/IDa9OC8wiPK0xoiu1YMkJE7efQjeCFxl2itFiy7BOQqG\n34N64bgTWQKBgFe8/UoeG6m6Vq5XXNPuKRJ8YfuCfX0jSDBmuSuWbtvcCp+qesMs\nMGW9sGxKGnQIaqhrzke2CsmYWjdPAExsI8uOoB4Jh3F06Vo4Mfdy/f3BEO0L7gpz\nf9W+WM9dOCTwEZ6BocdqkutYwQ0PqEMcNRLXiTaP9bD8bLj1mK1Np8XhAoGAeQrk\nR5IXrRBtKMhWinxvNWuBOBcQDVFKaFPDx28jvKdweVJbCoLoY3v2guPl+XueaGej\nIY9oE4oBMSWIrgW+tGt2FgIBuyYzdsyEVC8CRDtIELIkDZaLA/Y5bEUP/GAq+PW9\n7lZMDIwG6pAcnPKYpfo4iD7HpWplIgXsDMaF3qkCgYAnwJHOmc6c61/A7PxbIbFW\n6/IEnrO03Who3WG62qa9BgSx7h7uwJZBfKKyF+KwWwIyPD5AiLJAy8pckAUR9aHF\nkOO+wtQFTRisORnox47WPhwz96ariixoC5KSShs7lEpo5uGrbYoIr5dTBeIzztk7\nAMIzrSV/yul8+aWgCEW/tQ==\n-----END PRIVATE KEY-----"
};

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = "1VUfq9keBCml4rHrM-0flg9cnMY21IzIbdN3Sxn18-j4";

// List of all classes
const CLASSES = ['6th', '8th', 'Plus One', 'Plus Two', 'D1', 'D2', 'D3'];

// Function to get or create a sheet for a specific class
async function getOrCreateClassSheet(className) {
  try {
    // First, try to get the spreadsheet to check if the class sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    let classSheetId = null;
    const classSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === className
    );

    if (!classSheet) {
      // Create the class sheet if it doesn't exist
      const addSheetResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: className,
                },
              },
            },
          ],
        },
      });

      classSheetId = addSheetResponse.data.replies[0].addSheet.properties.sheetId;

      // Set up headers for the new sheet
      const headers = [
        ['Student Name', 'Admission Number', 'Subject', 'CE', 'TE', 'Total', 'Result', 'Submitted At']
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${className}!A1:H1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: headers,
        },
      });

      // Format header row
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: classSheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 8,
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
                  sheetId: classSheetId,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: 8,
                },
              },
            },
          ],
        },
      });
    }

    return className;
  } catch (error) {
    console.error('Error getting/creating class sheet:', error);
    throw error;
  }
}

export async function appendToSheet(data) {
  try {
    // Get or create the sheet for this class
    const sheetName = await getOrCreateClassSheet(data.class);

    // Format data for sheets
    const values = [
      [
        data.studentName,
        data.admissionNumber,
        data.subject,
        data.ce,
        data.te,
        data.total,
        data.result,
        data.submittedAt
      ]
    ];

    // Append data to the class-specific sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:H`,
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

// Function to create/setup all class sheets
export async function setupSheet() {
  try {
    // Create sheets for all classes
    for (const className of CLASSES) {
      await getOrCreateClassSheet(className);
    }
    return true;
  } catch (error) {
    console.error('Error setting up Google Sheets:', error);
    throw error;
  }
} 