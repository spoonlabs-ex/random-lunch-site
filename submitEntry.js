const crypto = require('crypto');
const { getEntries, getSheetConfig, getSheetsApi, makeJsonResponse } = require('./_sheet');

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return makeJsonResponse(200, { ok: true });
  }

  if (event.httpMethod !== 'POST') {
    return makeJsonResponse(405, { message: 'POST 요청만 허용됩니다.' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const name = String(body.name || '').trim();
    const mode = body.mode === 'group' ? 'group' : 'solo';

    if (!name) {
      return makeJsonResponse(400, { message: '이름을 입력해 주세요.' });
    }

    const existingEntries = await getEntries();
    const exists = existingEntries.some((entry) => entry.name.toLowerCase() === name.toLowerCase());

    if (exists) {
      return makeJsonResponse(409, { message: '이미 신청된 이름입니다.' });
    }

    const sheets = await getSheetsApi();
    const { spreadsheetId, sheetName } = getSheetConfig();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:E`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[id, name, mode, 'active', createdAt]],
      },
    });

    const entries = await getEntries();
    return makeJsonResponse(200, { entries });
  } catch (error) {
    return makeJsonResponse(500, {
      message: error.message || '신청 처리 중 오류가 발생했습니다.',
    });
  }
};
