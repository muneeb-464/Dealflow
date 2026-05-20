export function inviteEmailHtml({
  workspaceName,
  inviterName,
  role,
  inviteUrl,
}: {
  workspaceName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
}): string {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0A2A22;padding:32px;text-align:center;">
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
              DEAL<span style="color:#4ADE80;">FLOW</span>
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px 24px;">
            <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0A2A22;">You're invited!</p>
            <p style="margin:0 0 24px;font-size:14px;color:#767776;line-height:1.6;">
              <strong style="color:#0A2A22;">${inviterName}</strong> has invited you to join
              <strong style="color:#0A2A22;">${workspaceName}</strong> on Dealflow as a
              <strong style="color:#4ADE80;">${roleLabel}</strong>.
            </p>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 28px;">
                  <a href="${inviteUrl}"
                     style="display:inline-block;background:#4ADE80;color:#0A2A22;font-size:14px;font-weight:700;padding:14px 32px;border-radius:999px;text-decoration:none;">
                    Accept Invitation
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#a1a1aa;">
              This invite expires in <strong>48 hours</strong>. If you weren't expecting this, ignore this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;font-size:11px;color:#a1a1aa;">© 2026 Dealflow. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
