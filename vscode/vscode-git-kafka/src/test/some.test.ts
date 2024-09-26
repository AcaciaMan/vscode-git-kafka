import * as assert from "assert";

// test suite to test some typescript functionality
describe("Some Test Suite", () => {
  it("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

    it("Sample test 2", () => {
        assert.strictEqual(1, [1, 2, 3].indexOf(2));
    });

    it("Sample test 3", () => {
        // output something to the console
        console.log("Sample test 3");
        const sRegExp = "**src/m_grep/m_*.ts";

                const regexp = sRegExp
                  .replace(/\*\*/g, ".*")
                  // replace just *, and not .*, with [^/]*, which means any character except /
                  .replace(/(?<!\.)\*/g, "[^/]*");

                console.log(`regexp: ${regexp}`);



    });
});
//
