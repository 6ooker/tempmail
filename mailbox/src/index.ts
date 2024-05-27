// @ts-ignore
import PostalMime from "postal-mime";

export interface Env {
  TEMPMAIL_DB: KVNamespace
}

export default {
  async email(message: EmailMessage, env: Env) {
    // parse readable stream message to email 
    const parser = new PostalMime();
    const body = await new Response(message.raw).arrayBuffer();
    const email = await parser.parse(body);

    // count email for statistics
    let prev_count = await env.TEMPMAIL_DB.get("stats-count")
    if (prev_count === null) {prev_count = "0"};
    await env.TEMPMAIL_DB.put("stats-count", String(parseInt(prev_count)+1))

    let sender = email.from.address
    let recipient = email.to[0].address

    // generate random string (len = 8) 
    const suffix = Math.random().toString(16).slice(2, 10);
    // make key address followed by suffix (user@example.com-3dk4lk202)
    // suffix acts as key, email used for assignment
    const key = recipient + "-" + suffix

    let formatted_content = email.text.replaceAll("\n", "<br>");
    
    const data = {
      "suffix": suffix,
      "recipient": recipient,
      "sender": sender,
      "subject": email.subject,
      "content-plain": email.text,
      "content-plain-formatted": formatted_content,
      "content-html": email.html,
      "date": email.date 
    }

    await env.TEMPMAIL_DB.put(key, JSON.stringify(data), {expirationTtl: 7200})
  },
};

