const { google } = require('googleapis');

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} 환경변수가 설정되지 않았습니다.`);
  }
  return value;
}

function getGoogleAuth() {
  const clientEmail = getEnv('GOOGLE_CLIENT_EMAIL');
  const privateKey = getEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function getSheetsApi() {
  const auth = getGoogleAuth();
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
}

function getSheetConfig() {
  return {
    spreadsheetId: getEnv('GOOGLE_SPREADSHEET_ID'),
    sheetName: process.env.GOOGLE_SHEET_NAME || 'Entries',
  };
}

function makeJsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

async function getEntries() {
  const sheets = await getSheetsApi();
  const { spreadsheetId, sheetName } = getSheetConfig();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:E`,
  });

  const rows = response.data.values || [];

  return rows
    .filter((row) => row[0] && row[3] !== 'cancelled')
    .map((row) => ({
      id: row[0],
      name: row[1] || '',
      mode: row[2] || 'solo',
      status: row[3] || 'active',
      createdAt: row[4] || '',
    }))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

module.exports = {
  getEntries,
  getSheetConfig,
  getSheetsApi,
  makeJsonResponse,
};
