import { NeedEntity } from 'src/entities/need.entity';
import {
  CategoryDefinitionPersianEnum,
  CategoryEnum,
} from 'src/types/interfaces/interface';

export function fetchProductMessageContent(
  need: NeedEntity,
  signerAddress: string,
  role: string,
  signatureVersion: string,
) {
  const theContent =
    signatureVersion === 'v1'
      ? ` با امضای دیجیتال این نیاز امکان ذخیره غیر متمرکز و ثبت این نیاز بر روی بلاکچین را فراهم می‌کنید.  نیازی که دارای امضای دیجیتال مددکار، شاهد، میانجی و خانواده مجازی باشد نه تنها به شفافیت تراکنش‌ها کمک می‌کند، بلکه امکان تولید ارز دیجیتال (توکن / سهام) را به خویش‌آوندان می‌دهد تا سِی در جهت تبدیل شدن به مجموعه‌ای خودمختار و غیر متمرکز گام بردارد. توکن های تولید شده از هر نیاز به افرادی که در برطرف شدن نیاز مشارکت داشته‌اند ارسال می‌شود، که می‌توانند از آن برای رای دادن، ارتقا کیفیت کودکان و سِی استفاده کنند.`
      : signatureVersion === 'v2'
      ? `با امضای دیجیتال این نیاز امکان ذخیره غیر متمرکز و ثبت این نیاز بر روی بلاکچین را فراهم می‌کنید.  نیازی که دارای امضای دیجیتال مددکار، شاهد، میانجی و خانواده مجازی باشد نه تنها به شفافیت تراکنش‌ها کمک می‌کند، بلکه امکان تولید ارز دیجیتال (توکن / سهام) را به خویش‌آوندان می‌دهد تا سِی در جهت تبدیل شدن به مجموعه‌ای خودمختار و غیر متمرکز گام بردارد.`
      : signatureVersion === 'v3' &&
        'با امضای دیجیتال این نیاز شما جزئیات آن را تایید می‌کنید و همچنین امکان ذخیره غیر متمرکز و ثبت این نیاز بر روی بلاکچین را فراهم می‌کنید.  نیازی که دارای امضای دیجیتال مددکار، شاهد، میانجی و خانواده مجازی باشد نه تنها به شفافیت تراکنش‌ها کمک می‌کند، بلکه امکان تولید ارز دیجیتال (توکن / سهام) را به خویش‌آوندان می‌دهد تا سِی در جهت تبدیل شدن به مجموعه‌ای خودمختار و غیر متمرکز گام بردارد.';

  const productVoucher = {
    needId: need.flaskId,
    title: need.title || 'No Title',
    category:
      need.category === CategoryEnum.GROWTH
        ? CategoryDefinitionPersianEnum.GROWTH
        : need.category === CategoryEnum.HEALTH
        ? CategoryDefinitionPersianEnum.HEALTH
        : need.category === CategoryEnum.JOY
        ? CategoryDefinitionPersianEnum.JOY
        : CategoryDefinitionPersianEnum.SURROUNDING,
    paid: need.cost,
    deliveryCode: need.deliveryCode,
    child: need.child.sayNameTranslations.fa,
    signer: signerAddress,
    role: role, // string human readable
    content: theContent,
  } as const;

  const productTypes = {
    Voucher: [
      { name: 'needId', type: 'uint256' },
      { name: 'title', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'paid', type: 'uint256' },
      { name: 'deliveryCode', type: 'string' },
      { name: 'child', type: 'string' },
      { name: 'role', type: 'string' },
      { name: 'content', type: 'string' },
    ],
  } as const;
  return {
    productVoucher,
    productTypes,
  };
}

export function fetchServiceMessageContent(
  need: NeedEntity,
  signerAddress: string,
  role: string,
  signatureVersion: string,
) {
  const theContent =
    signatureVersion === 'v1'
      ? ` با امضای دیجیتال این نیاز امکان ذخیره غیر متمرکز و ثبت این نیاز بر روی بلاکچین را فراهم می‌کنید.  نیازی که دارای امضای دیجیتال مددکار، شاهد، میانجی و خانواده مجازی باشد نه تنها به شفافیت تراکنش‌ها کمک می‌کند، بلکه امکان تولید ارز دیجیتال (توکن / سهام) را به خویش‌آوندان می‌دهد تا سِی در جهت تبدیل شدن به مجموعه‌ای خودمختار و غیر متمرکز گام بردارد. توکن های تولید شده از هر نیاز به افرادی که در برطرف شدن نیاز مشارکت داشته‌اند ارسال می‌شود، که می‌توانند از آن برای رای دادن، ارتقا کیفیت کودکان و سِی استفاده کنند.`
      : signatureVersion === 'v2'
      ? `با امضای دیجیتال این نیاز امکان ذخیره غیر متمرکز و ثبت این نیاز بر روی بلاکچین را فراهم می‌کنید.  نیازی که دارای امضای دیجیتال مددکار، شاهد، میانجی و خانواده مجازی باشد نه تنها به شفافیت تراکنش‌ها کمک می‌کند، بلکه امکان تولید ارز دیجیتال (توکن / سهام) را به خویش‌آوندان می‌دهد تا سِی در جهت تبدیل شدن به مجموعه‌ای خودمختار و غیر متمرکز گام بردارد.`
      : signatureVersion === 'v3' &&
        'با امضای دیجیتال این نیاز شما جزئیات آن را تایید می‌کنید و همچنین امکان ذخیره غیر متمرکز و ثبت این نیاز بر روی بلاکچین را فراهم می‌کنید.  نیازی که دارای امضای دیجیتال مددکار، شاهد، میانجی و خانواده مجازی باشد نه تنها به شفافیت تراکنش‌ها کمک می‌کند، بلکه امکان تولید ارز دیجیتال (توکن / سهام) را به خویش‌آوندان می‌دهد تا سِی در جهت تبدیل شدن به مجموعه‌ای خودمختار و غیر متمرکز گام بردارد.';

  const serviceVoucher = {
    title: need.title || 'No Title',
    needId: need.flaskId,
    category:
      need.category === CategoryEnum.GROWTH
        ? CategoryDefinitionPersianEnum.GROWTH
        : need.category === CategoryEnum.HEALTH
        ? CategoryDefinitionPersianEnum.HEALTH
        : need.category === CategoryEnum.JOY
        ? CategoryDefinitionPersianEnum.JOY
        : CategoryDefinitionPersianEnum.SURROUNDING,
    paid: need.cost,
    bankTrackId: need.bankTrackId || 'N/A',
    child: need.child.sayNameTranslations.fa,
    receipts: need.receipts.length,
    signer: signerAddress,
    role: role, // string human readable
    content: theContent,
  } as const;

  const serviceTypes = {
    Voucher: [
      { name: 'title', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'paid', type: 'uint256' },
      { name: 'child', type: 'string' },
      { name: 'bankTrackId', type: 'string' },
      { name: 'receipts', type: 'uint256' },
      { name: 'role', type: 'string' },
      { name: 'content', type: 'string' },
    ],
  } as const;
  return {
    serviceVoucher,
    serviceTypes,
  };
}
