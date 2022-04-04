const router = require("express").Router();

const checkDigitMod10 = (sequence, checkDigit) => {
  const reverseSequence = sequence.split("").reverse();
  const reverseSequenceMultiplied = reverseSequence.map((digit, index) => {
    if (index % 2 === 0) {
      return parseInt(digit) * 2;
    } else {
      return parseInt(digit) * 1;
    }
  });

  const sum = reverseSequenceMultiplied
    .join("")
    .split("")
    .reduce((acc, value) => (acc += parseInt(value)), 0);

  const sumMod10 = sum % 10;
  let calculatedCheckDigit = 10 - sumMod10;

  if (calculatedCheckDigit === 10) {
    calculatedCheckDigit = 0;
  }

  if (calculatedCheckDigit === parseInt(checkDigit)) {
    return true;
  } else {
    return false;
  }
};

const checkDigitMod11 = (sequence, checkDigit, docType) => {
  const reverseSequence = sequence.split("").reverse();

  let multiplierFactor = 1;
  const reverseSequenceMultiplied = reverseSequence.map((digit) => {
    multiplierFactor++;

    if (multiplierFactor === 10) {
      multiplierFactor = 2;
    }

    return parseInt(digit) * multiplierFactor;
  });

  const sum = reverseSequenceMultiplied.reduce(
    (acc, value) => (acc += parseInt(value)),
    0
  );

  const sumMod11 = sum % 11;
  let calculatedCheckDigit = 11 - sumMod11;

  if (docType === "titulo") {
    if (calculatedCheckDigit === 0) {
      calculatedCheckDigit = 1;
    }

    if (calculatedCheckDigit === 10) {
      calculatedCheckDigit = 1;
    }

    if (calculatedCheckDigit === 11) {
      calculatedCheckDigit = 1;
    }
  }

  if (docType === "convenio") {
    if (calculatedCheckDigit === 1) {
      calculatedCheckDigit = 1;
    }

    if (calculatedCheckDigit === 10) {
      calculatedCheckDigit = 0;
    }

    if (calculatedCheckDigit === 11) {
      calculatedCheckDigit = 0;
    }
  }

  if (calculatedCheckDigit === parseInt(checkDigit)) {
    return true;
  } else {
    return false;
  }
};

router.get("/boleto", async (req, res) => {
  return res.status(400).json({ error: "Linha digitável inexistente." });
});

router.get("/boleto/:typedCode", async (req, res) => {
  const { typedCode } = req.params;

  const regex = /^[0-9]+$/;
  if (!regex.test(typedCode)) {
    return res
      .status(400)
      .json({ error: "Linha digitável contém caracteres inválidos." });
  }

  if (typedCode.length < 47) {
    return res
      .status(400)
      .json({ error: "Linha digitável menor do que o esperado." });
  }

  if (typedCode.length > 48) {
    return res
      .status(400)
      .json({ error: "Linha digitável maior do que o esperado." });
  }

  if (typedCode.length === 47) {
    const field1 = typedCode.substring(0, 9);
    const checkDigitField1 = typedCode.substring(9, 10);

    const field2 = typedCode.substring(10, 20);
    const checkDigitField2 = typedCode.substring(20, 21);

    const field3 = typedCode.substring(21, 31);
    const checkDigitField3 = typedCode.substring(31, 32);

    if (!checkDigitMod10(field1, checkDigitField1)) {
      return res
        .status(400)
        .json({ error: "Dígito verificador do campo 1 inválido." });
    }

    if (!checkDigitMod10(field2, checkDigitField2)) {
      return res
        .status(400)
        .json({ error: "Dígito verificador do campo 2 inválido." });
    }

    if (!checkDigitMod10(field3, checkDigitField3)) {
      return res
        .status(400)
        .json({ error: "Dígito verificador do campo 3 inválido." });
    }

    const bank = typedCode.substring(0, 3);
    const currency = typedCode.substring(3, 4);
    const generalCheckDigit = typedCode.substring(32, 33);
    const expirationFactor =
      parseInt(typedCode.substring(33, 37)) >= 1000
        ? typedCode.substring(33, 37)
        : null;
    const value = typedCode.substring(
      expirationFactor ? 37 : 33,
      typedCode.length
    );
    const freeField =
      typedCode.substring(4, 9) +
      typedCode.substring(10, 20) +
      typedCode.substring(21, 31);

    const barCode =
      bank +
      currency +
      generalCheckDigit +
      (expirationFactor ? expirationFactor : "") +
      value +
      freeField;

    const barCodeWithoutGeneralCheckDigit =
      bank +
      currency +
      (expirationFactor ? expirationFactor : "") +
      value +
      freeField;

    if (
      !checkDigitMod11(
        barCodeWithoutGeneralCheckDigit,
        generalCheckDigit,
        "titulo"
      )
    ) {
      return res
        .status(400)
        .json({ error: "Dígito verificador geral inválido." });
    }

    const amount = (parseInt(value) * 0.01).toFixed(2);

    const initialDate = new Date(Date.UTC(1997, 9, 7)); // itnitial base at zero time
    let baseDate = new Date(initialDate.getTime()); // current base date at zero time

    const now = new Date().toISOString().split("T")[0];
    const today = new Date(
      Date.UTC(now.split("-")[0], now.split("-")[1] - 1, now.split("-")[2])
    ); // today at zero time

    const dateDifference =
      today.setDate(today.getDate()) - baseDate.setDate(baseDate.getDate()); // date difference in milliseconds

    const numberOfDays = Math.ceil(dateDifference / (1000 * 60 * 60 * 24)); // date difference in days

    if (numberOfDays % 10000 === 0) {
      baseDate = new Date(today.setDate(today.getDate() - 1000)); // new base date if day 10000
    }

    // defines a new base date if the deadline is reached, which occurs on the day number 10000 after the previous base date
    const expirationDate = expirationFactor
      ? new Date(
          baseDate.setDate(baseDate.getDate() + parseInt(expirationFactor))
        )
          .toISOString()
          .split("T")[0]
      : null;

    return res.status(200).json({ barCode, amount, expirationDate });
  }

  if (typedCode.length === 48) {
    const field1 = typedCode.substring(0, 11);
    const checkDigitField1 = typedCode.substring(11, 12);

    const field2 = typedCode.substring(12, 23);
    const checkDigitField2 = typedCode.substring(23, 24);

    const field3 = typedCode.substring(24, 35);
    const checkDigitField3 = typedCode.substring(35, 36);

    const field4 = typedCode.substring(36, 47);
    const checkDigitField4 = typedCode.substring(47, 48);

    if (!checkDigitMod10(field1, checkDigitField1)) {
      return res
        .status(400)
        .json({ error: "Dígito verificador do campo 1 inválido." });
    }

    if (!checkDigitMod10(field2, checkDigitField2)) {
      return res
        .status(400)
        .json({ error: "Dígito verificador do campo 2 inválido." });
    }

    if (!checkDigitMod10(field3, checkDigitField3)) {
      return res
        .status(400)
        .json({ error: "Dígito verificador do campo 3 inválido." });
    }

    if (!checkDigitMod10(field4, checkDigitField4)) {
      return res
        .status(400)
        .json({ error: "Dígito verificador do campo 4 inválido." });
    }

    const barCode = field1 + field2 + field3 + field4;

    const product = barCode.substring(0, 1);
    const segment = barCode.substring(1, 2);
    const valueIdentifier = barCode.substring(2, 3);
    const generalCheckDigit = barCode.substring(3, 4);
    const value = barCode.substring(4, 15);
    const cnpj = segment === "6" ? true : false;
    const companyIdentification = cnpj
      ? barCode.substring(15, 23)
      : barCode.substring(15, 19);
    const freeField = cnpj
      ? barCode.substring(23, barCode.length)
      : barCode.substring(19, barCode.length);

    const barCodeWithoutGeneralCheckDigit =
      product +
      segment +
      valueIdentifier +
      value +
      companyIdentification +
      freeField;

    if (
      valueIdentifier === "6" &&
      !checkDigitMod10(barCodeWithoutGeneralCheckDigit, generalCheckDigit)
    ) {
      return res
        .status(400)
        .json({ error: "Dígito verificador geral inválido." });
    }

    if (
      valueIdentifier === "7" &&
      !checkDigitMod10(barCodeWithoutGeneralCheckDigit, generalCheckDigit)
    ) {
      return res
        .status(400)
        .json({ error: "Dígito verificador geral inválido." });
    }

    if (
      valueIdentifier === "8" &&
      !checkDigitMod11(
        barCodeWithoutGeneralCheckDigit,
        generalCheckDigit,
        "convenio"
      )
    ) {
      return res
        .status(400)
        .json({ error: "Dígito verificador geral inválido." });
    }

    if (
      valueIdentifier === "9" &&
      !checkDigitMod11(
        barCodeWithoutGeneralCheckDigit,
        generalCheckDigit,
        (docType = 2)
      )
    ) {
      return res
        .status(400)
        .json({ error: "Dígito verificador geral inválido." });
    }

    const amount = (parseInt(value) * 0.01).toFixed(2);

    // const expirationDate = cnpj
    //   ? barCode.substring(23, 31)
    //   : barCode.substring(19, 27);

    return res.status(200).json({ barCode, amount });
  }
});

module.exports = router;
