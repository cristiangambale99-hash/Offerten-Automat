export const dynamic = 'force-dynamic';
export async function GET(req) { return new Response(null, { status: 302, headers: { Location: '/login', 'Set-Cookie': 'oa_session=; Path=/; HttpOnly; Max-Age=0' } }); }
