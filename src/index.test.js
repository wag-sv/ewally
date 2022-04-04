const request = require("supertest");
const app = require("./server");

describe("Testing Server Routes", () => {
  it("Should use route /boleto with no typed code and return status code 400 and error message.", async () => {
    const res = await request(app).get("/boleto");

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Should use route /boleto/:typedCode with invalid characters in the typed code and return status code 400 and error message.", async () => {
    const res = await request(app).get(
      "/boleto/21290001192110001210904475617405975870000002000AAA"
    );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Should use route /boleto/:typedCode with smaller than expected typed code and return status code 400 and error message.", async () => {
    const res = await request(app).get(
      "/boleto/2129000119211000121090447561740597587"
    );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Should use route /boleto/:typedCode with bigger than expected typed code and return status code 400 and error message.", async () => {
    const res = await request(app).get(
      "/boleto/212900011921100012109044756174059758700000020009999999999999"
    );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Should use route /boleto/:typedCode with a typed code of type 'título bancário' with invalid field 1 check digit and return status code 400 and error message.", async () => {
    const res = await request(app).get(
      "/boleto/21290001182110001210904475617405975870000002000"
    );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Should use route /boleto/:typedCode with a typed code of type 'título bancário' with invalid field 2 check digit and return status code 400 and error message.", async () => {
    const res = await request(app).get(
      "/boleto/21290001192110001210804475617405975870000002000"
    );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Should use route /boleto/:typedCode with a typed code of type 'título bancário' with invalid field 3 check digit and return status code 400 and error message.", async () => {
    const res = await request(app).get(
      "/boleto/21290001192110001210904475617408975870000002000"
    );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Should use route /boleto/:typedCode with a typed code of type 'título bancário' with invalid general check digit and return status code 400 and error message.", async () => {
    const res = await request(app).get(
      "/boleto/21290001192110001210904475617405875870000002000"
    );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Should use route /boleto/:typedCode with a typed code of type 'convênio' with invalid field 1 check digit and return status code 400 and error message.", async () => {
    const res = await request(app).get(
      "/boleto/826200000008627305340002002022001073255201005048"
    );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Should use route /boleto/:typedCode with a typed code of type 'convênio' with invalid field 2 check digit and return status code 400 and error message.", async () => {
    const res = await request(app).get(
      "/boleto/826200000006627305340008002022001073255201005048"
    );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Should use route /boleto/:typedCode with a typed code of type 'convênio' with invalid field 3 check digit and return status code 400 and error message.", async () => {
    const res = await request(app).get(
      "/boleto/826200000006627305340002002022001078255201005048"
    );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Should use route /boleto/:typedCode with a typed code of type 'convênio' with invalid field 4 check digit and return status code 400 and error message.", async () => {
    const res = await request(app).get(
      "/boleto/826200000006627305340002002022001073255201005040"
    );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Should use route /boleto/:typedCode with a typed code of type 'convênio' with invalid general check digit and return status code 400 and error message.", async () => {
    const res = await request(app).get(
      "/boleto/826800000006627305340002002022001073255201005048"
    );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Should use route /boleto/:typedCode with a valid typed code of type 'título bancário' and return status code 200 and properties barCode, amount and expirationDate.", async () => {
    const res = await request(app).get(
      "/boleto/21290001192110001210904475617405975870000002000"
    );

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("barCode");
    expect(res.body).toHaveProperty("amount");
  });

  it("Should use route /boleto/:typedCode with a valid typed code of type 'título bancário' with value greater than R$99.999.999,99 and return status code 200 and properties barCode, amount and expirationDate.", async () => {
    const res = await request(app).get(
      "/boleto/21290001192110001210904475617405600019999999999"
    );

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("barCode");
    expect(res.body).toHaveProperty("amount");
  });

  it("Should use route /boleto/:typedCode with a valid typed code of type 'convênio' and return status code 200 and properties barCode and amount.", async () => {
    const res = await request(app).get(
      "/boleto/826200000006627305340002002022001073255201005048"
    );

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("barCode");
    expect(res.body).toHaveProperty("amount");
  });
});
