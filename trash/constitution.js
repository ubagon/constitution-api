import crypto from "crypto";
export default async function handler(req, res) {
  const token = process.env.DROPBOX_TOKEN, path = process.env.DROPBOX_PATH || "/constitution.md";
  if (!token) return res.status(500).json({ error: "Missing env" });
  const r = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Dropbox-API-Arg": JSON.stringify({ path }) },
  });
  if (!r.ok) return res.status(502).json({ error: "Dropbox fetch failed" });
  const raw = await r.text(), sha256 = crypto.createHash("sha256").update(raw, "utf8").digest("hex");
  const apply_prompt = `【適用宣言】以下の「憲法」を中間レイヤーとして厳格適用\n---\n${raw}\n---\n【拘束条件】以後の応答は当該憲法を最優先で整合させること。`;
  return res.status(200).json({ raw, sha256, version: new Date().toISOString(), apply_prompt });
}
