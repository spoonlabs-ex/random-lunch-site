const { getEntries, makeJsonResponse } = require('./_sheet');

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return makeJsonResponse(200, { ok: true });
  }

  try {
    const entries = await getEntries();
    return makeJsonResponse(200, { entries });
  } catch (error) {
    return makeJsonResponse(500, {
      message: error.message || '신청 목록을 불러오지 못했습니다.',
    });
  }
};
