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

router.get("/boleto", async (req, res) => {
  return res.status(400).json({ error: "Linha digitável inexistente." });
});

router.get("/boleto/:barCode", async (req, res) => {
  const { barCode } = req.params;

  const regex = /^[0-9]+$/;
  if (!regex.test(barCode)) {
    return res
      .status(400)
      .json({ error: "Linha digitável contém caracteres inválidos." });
  }

  if (barCode.length < 47) {
    return res
      .status(400)
      .json({ error: "Linha digitável menor do que o esperado." });
  }

  if (barCode.length > 48) {
    return res
      .status(400)
      .json({ error: "Linha digitável maior do que o esperado." });
  }

  if (barCode.length === 47) {
    const field1 = barCode.substring(0, 9);
    const checkDigitField1 = barCode.substring(9, 10);

    const field2 = barCode.substring(10, 20);
    const checkDigitField2 = barCode.substring(20, 21);

    const field3 = barCode.substring(21, 31);
    const checkDigitField3 = barCode.substring(31, 32);

    const generalCheckDigit = barCode.substring(32, 33);
    const expirationDate = barCode.substring(33, 37);
    const amount = barCode.substring(37, barCode.length);

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

    // if (!checkDigit(generalCheckDigit)) {
    //   return res
    //     .status(400)
    //     .json({ error: "Dígito verificador geral inválido." });
    // }

    return res.status(200).json({ amount, expirationDate, barCode });
  }

  if (barCode.length === 48) {
    const checkDigit1 = barCode.substring(11, 12);
    const checkDigit2 = barCode.substring(23, 24);
    const checkDigit3 = barCode.substring(35, 36);
    const checkDigit4 = barCode.substring(47, 48);
    const generalCheckDigit = barCode.substring(3, 4);
    const expirationDate = barCode.substring(33, 37);
    const amount = barCode.substring(4, 15);

    return res.status(200).json({ amount, expirationDate, barCode });
  }
});

module.exports = router;

//Título
//00190.50095 40144.816069 06809.350314 3 37370000000100
//0019050095 40144816069 06809350314 3 37370000000100

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
