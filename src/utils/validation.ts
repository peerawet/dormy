// Form validation utilities
export interface ValidationResult {
  isValid: boolean;
  message: string;
}

// Validation rules
export const validators = {
  required: (value: string, fieldName: string): ValidationResult => {
    const isValid = value.trim().length > 0;
    return {
      isValid,
      message: isValid ? "" : `กรุณากรอก${fieldName}`,
    };
  },

  minLength: (
    value: string,
    min: number,
    fieldName: string
  ): ValidationResult => {
    const isValid = value.trim().length >= min;
    return {
      isValid,
      message: isValid ? "" : `${fieldName}ต้องมีอย่างน้อย ${min} ตัวอักษร`,
    };
  },

  maxLength: (
    value: string,
    max: number,
    fieldName: string
  ): ValidationResult => {
    const isValid = value.trim().length <= max;
    return {
      isValid,
      message: isValid ? "" : `${fieldName}ต้องไม่เกิน ${max} ตัวอักษร`,
    };
  },

  number: (value: string, fieldName: string): ValidationResult => {
    const numValue = Number(value);
    const isValid = !isNaN(numValue) && isFinite(numValue);
    return {
      isValid,
      message: isValid ? "" : `${fieldName}ต้องเป็นตัวเลขเท่านั้น`,
    };
  },

  positiveNumber: (value: string, fieldName: string): ValidationResult => {
    const numValue = Number(value);
    const isValid = !isNaN(numValue) && isFinite(numValue) && numValue > 0;
    return {
      isValid,
      message: isValid ? "" : `${fieldName}ต้องเป็นตัวเลขที่มากกว่า 0`,
    };
  },

  nonNegativeNumber: (value: string, fieldName: string): ValidationResult => {
    const numValue = Number(value);
    const isValid = !isNaN(numValue) && isFinite(numValue) && numValue >= 0;
    return {
      isValid,
      message: isValid
        ? ""
        : `${fieldName}ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0`,
    };
  },

  phone: (value: string): ValidationResult => {
    const phoneRegex = /^[0-9]{9,10}$/;
    const isValid = phoneRegex.test(value.replace(/[-\s]/g, ""));
    return {
      isValid,
      message: isValid ? "" : "เบอร์โทรศัพท์ไม่ถูกต้อง (9-10 หลัก)",
    };
  },

  idCard: (value: string): ValidationResult => {
    if (!value) return { isValid: true, message: "" }; // Optional field
    const idCardRegex = /^[0-9]{13}$/;
    const isValid = idCardRegex.test(value);
    return {
      isValid,
      message: isValid ? "" : "เลขบัตรประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก",
    };
  },

  promptpay: (value: string): ValidationResult => {
    if (!value.trim()) return { isValid: true, message: "" }; // Optional field

    const cleanValue = value.replace(/\D/g, "");

    // PromptPay อาจเป็น เบอร์โทร 10 หลัก หรือ เลขบัตรประชาชน 13 หลัก
    if (cleanValue.length === 10) {
      // เบอร์โทรศัพท์ 10 หลัก ต้องขึ้นต้นด้วย 0
      if (!cleanValue.startsWith("0")) {
        return { isValid: false, message: "เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0" };
      }
      return { isValid: true, message: "" };
    } else if (cleanValue.length === 13) {
      // เลขบัตรประชาชน 13 หลัก
      return { isValid: true, message: "" };
    } else {
      return {
        isValid: false,
        message:
          "PromptPay ต้องเป็นเบอร์โทร 10 หลัก หรือเลขบัตรประชาชน 13 หลัก",
      };
    }
  },
};

// Combine multiple validations
export const validateField = (
  value: string,
  validations: Array<(value: string) => ValidationResult>
): ValidationResult => {
  for (const validation of validations) {
    const result = validation(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true, message: "" };
};

// Form field component with validation
export interface FieldValidation {
  [key: string]: ValidationResult;
}

export const validateForm = (
  fields: { [key: string]: string },
  validationRules: { [key: string]: Array<(value: string) => ValidationResult> }
): { isValid: boolean; errors: FieldValidation } => {
  const errors: FieldValidation = {};
  let isValid = true;

  Object.keys(validationRules).forEach((fieldName) => {
    const fieldValue = fields[fieldName] || "";
    const validations = validationRules[fieldName];
    const result = validateField(fieldValue, validations);

    errors[fieldName] = result;
    if (!result.isValid) {
      isValid = false;
    }
  });

  return { isValid, errors };
};
