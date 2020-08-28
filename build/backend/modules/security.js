import crypto from 'crypto';

const github = (request, secret) => {
  // X-Hub-Signature: sha1=5d340e016d0c7b31976a8ffd9bf63c2602d1f1b4
  const header = request.get('X-Hub-Signature');
  if (!header) return { error: 'Missing X-Hub-Signature header!' };
  const [alghoritm, original] = header.split('=');
  const calculated = crypto.createHmac(alghoritm, secret).update(request.rawBody).digest('hex');
  if (calculated === original) return { verified: { subject: 'GitHub', company: true } };
  return { error: 'Signatures are different!', original, calculated };
};

const validateWebhook = (request, settings) => {
  if (!settings?.security) return null;
  const { type, secret } = settings.security;
  switch (type.toLowerCase()) {
    case 'github':
      return github(request, secret);
    default:
      throw new Error(`Unknown webhook type: ${type}`);
  }
};

export default {
  validateWebhook
};
