'use client';

import NaverPaymentButton from '@/components/NaverPaymentButton';
import TossPaymentButton from '@/components/TossPaymentButton';

const page = () => {

  return (
    <div className='flex flex-col items-start gap-[10px] p-[30px]'>
      <TossPaymentButton />
      <NaverPaymentButton />
    </div>
  );
};

export default page;
