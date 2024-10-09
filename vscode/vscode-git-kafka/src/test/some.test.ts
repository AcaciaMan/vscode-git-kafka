import * as assert from "assert";
import * as solr from "solr-client";

// test suite to test some typescript functionality
describe("Some Test Suite", () => {
  it("Sample test", () => {
    assert.strictEqual([1, 2, 3].indexOf(5), -1);
    assert.strictEqual([1, 2, 3].indexOf(0), -1);
  });

    it("Sample test 2", () => {
        assert.strictEqual([1, 2, 3].indexOf(2), 1);
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

    it("Sample test 4", async () => {
        const client = solr.createClient({
            host: "localhost",
            port: "8983",
            core: "vscodegit",
            path: "/solr",
        });


        console.log("client: ", client);


        const query = client.query().q("imports something").rows(10);
        query.parameters.push("sort=clicks desc, id asc".replace(/ /g, "%20").replace(/,/g, "%2C"));
        console.log("Executing query: ", query);

        const searchResponse = await client.search(
          query
        );

        console.log("searchResponse: ", searchResponse);

        //const response = searchResponse.response;
        //console.log("response: ", response);

        //const docs = response.docs;
        //console.log("docs: ", docs);

        //const numFound = response.numFound;
        //console.log("numFound: ", numFound);

        console.log( await client.ping());



});
});

