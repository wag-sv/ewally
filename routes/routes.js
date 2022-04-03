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
  const calculatedCheckDigit = 10 - sumMod10;

  if (calculatedCheckDigit === 10) {
    calculatedCheckDigit = 0;
  }

  if (calculatedCheckDigit === parseInt(checkDigit)) {
    return true;
  } else {
    return false;
  }
};

const checkDigitMod11 = (sequence, checkDigit) => {
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
  const calculatedCheckDigit = 11 - sumMod11;

  if (calculatedCheckDigit === 0) {
    calculatedCheckDigit = 1;
  }

  if (calculatedCheckDigit === 10) {
    calculatedCheckDigit = 1;
  }

  if (calculatedCheckDigit === 11) {
    calculatedCheckDigit = 1;
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
    const expirationFactor = typedCode.substring(33, 37);
    const amount = typedCode.substring(37, typedCode.length);
    const freeField =
      typedCode.substring(4, 9) +
      typedCode.substring(10, 20) +
      typedCode.substring(21, 31);

    const barCode =
      bank +
      currency +
      generalCheckDigit +
      expirationFactor +
      amount +
      freeField;

    const barCodeWithoutGeneralCheckDigit =
      bank + currency + expirationFactor + amount + freeField;

    if (!checkDigitMod11(barCodeWithoutGeneralCheckDigit, generalCheckDigit)) {
      return res
        .status(400)
        .json({ error: "Dígito verificador geral inválido." });
    }

    return res.status(200).json({ barCode });
  }

  if (typedCode.length === 48) {
    // return res.status(200).json({ amount, expirationDate, barCode });
  }
});

module.exports = router;

//Título
//00190.50095 40144.816069 06809.350314 3 37370000000100
//0019050095 40144816069 06809350314 3 37370000000100
//001905009  4014481606  0680935031    37370000000100

//Convênio
//82620000000 6 62730534000 2 00202200107 3 25520100504 8
//826200000006627305340002002022001073255201005048

//formato data de vencimento AAAAMMDD nas 8 primeiras posições do campo livre

//Regex

// You could use /^\d+$/.

// That means:

// ^ string start
// \d+ a digit, once or more times
// $ string end
// This way you force the match to only numbers from start to end of that string.

//21299758700000020000001121100012100447561740
//21299758700000020000001121100012100447561740
