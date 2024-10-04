import * as assert from "assert";
const solr = require("solr-client");

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

    it("Sample test 4", (done) => {
        const client = solr.createClient({
            host: "localhost",
            port: "8983",
            core: "events",
            path: "/solr",
        });

        console.log("client: ", client);


        const query = client.query().q("*");
        console.log("Executing query: ", query);
        
        client.search(query, function (err: any, obj: any) {
            console.log("searching for all docs");
            if (err) {
                console.log(err);
                done(err);
            } else {
                console.log("Obj", obj);
                done();
            }
        });


});
});

