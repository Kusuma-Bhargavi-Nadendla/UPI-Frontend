import { useEffect, useState } from 'react';
import qrcode from 'qrcode';
interface UPIQRCodeProps {
  upiUrl: string;
}

const UPIQRCode = ({ upiUrl }: UPIQRCodeProps) => {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically import qrcode to avoid SSR/ESM issues
    // import('qrcode').then(qrcode => {
      qrcode.toString(upiUrl, { type: 'svg', margin: 1, width: 200 }, (err, string) => {
        if (err) {
          console.error('QR Generation failed:', err);
          return;
        }
        setSvg(string);
      });
    // });
  }, [upiUrl]);

  if (!svg) {
    return <div>Loading QR...</div>;
  }

  return (
    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
      <h4> Scan to Pay</h4>
      <div
        dangerouslySetInnerHTML={{ __html: svg }}
        style={{ display: 'inline-block' }}
      />
      <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
        Open any UPI app → Scan → Pay
      </p>
    </div>
  );
};

export default UPIQRCode;