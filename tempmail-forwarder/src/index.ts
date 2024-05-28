import { WorkerEntrypoint } from "cloudflare:workers"
import { Resend } from 'resend'

export default class extends WorkerEntrypoint {
    async fetch() { return new Response("Hello from Forwarder") }

    async forwardmail(mail, forward) {
        const resend = new Resend(this.env.RESEND_API_TOKEN)

        const data = await resend.emails.send({
            from: 'Tempmail <forward@cbdrik.de>',
            to: forward,
            subject: 'Forward - ' + mail["subject"],
            text: mail["content-plain"] + "\n \nForwarded by Riks Tempmail Service.",
            reply_to: mail["from"],
        })

        return JSON.stringify(data)
    }
}
