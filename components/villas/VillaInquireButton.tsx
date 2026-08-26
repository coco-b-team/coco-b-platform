'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { InquiryModal } from './InquiryModal';

type ModalVilla = {
  id: number | string;
  title: string;
  mainImage: string | null;
  startingPrice: number | null;
  priceUnit: string;
  priceOnRequest: boolean;
  guestCapacity: number | null;
  bedrooms: number | null;
};

export function VillaInquireButton({ villa, className }: { villa: ModalVilla; className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)} className={className}>
        Inquire
      </Button>
      {open && <InquiryModal villa={villa} onClose={() => setOpen(false)} />}
    </>
  );
}
