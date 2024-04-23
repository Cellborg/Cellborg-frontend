import {SESSION_COOKIE} from '../../constants'
import cookie from "cookie";

async function getToken(context) {
    // Get the user's JWT access token from next's server-side cookie
    try {
        const session_cookie = cookie.parse(context.req.headers.cookie);
        const token = session_cookie[`${SESSION_COOKIE}`];
        return token;
      }
      catch (err) {
        console.log("error getting session cookie", err);
        return null;
      }
}

export { getToken }