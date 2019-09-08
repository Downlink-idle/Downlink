const faker = require('faker');

let companies = [];
for(let i = 0; i < 40; i ++)
{
    let companyGen = faker.company;
    companies.push(companyGen.companyName());
}
console.log(companies);
