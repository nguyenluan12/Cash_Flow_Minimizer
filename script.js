class Person {
    constructor(name, netAmount, types) {
        this.name = name;
        this.netAmount = netAmount;
        this.types = types;
    }
}

function getMinIndex(listOfNetAmounts, numPersons) {
    let min = Number.MAX_SAFE_INTEGER, minIndex = -1;
    for (let i = 0; i < numPersons; i++) {
        if (listOfNetAmounts[i].netAmount === 0) continue;

        if (listOfNetAmounts[i].netAmount < min) {
            minIndex = i;
            min = listOfNetAmounts[i].netAmount;
        }
    }
    return minIndex;
}

function getSimpleMaxIndex(listOfNetAmounts, numPersons) {
    let max = Number.MIN_SAFE_INTEGER, maxIndex = -1;
    for (let i = 0; i < numPersons; i++) {
        if (listOfNetAmounts[i].netAmount === 0) continue;

        if (listOfNetAmounts[i].netAmount > max) {
            maxIndex = i;
            max = listOfNetAmounts[i].netAmount;
        }
    }
    return maxIndex;
}

function getMaxIndex(listOfNetAmounts, numPersons, minIndex, input, maxNumTypes) {
    let max = Number.MIN_SAFE_INTEGER;
    let maxIndex = -1;
    let matchingType = null;

    for (let i = 0; i < numPersons; i++) {
        if (listOfNetAmounts[i].netAmount === 0) continue;
        if (listOfNetAmounts[i].netAmount < 0) continue;

        let intersection = new Set([...listOfNetAmounts[minIndex].types].filter(x => listOfNetAmounts[i].types.has(x)));

        if (intersection.size !== 0 && max < listOfNetAmounts[i].netAmount) {
            max = listOfNetAmounts[i].netAmount;
            maxIndex = i;
            matchingType = Array.from(intersection)[0];
        }
    }

    return { maxIndex, matchingType };
}

function printAns(ansGraph, numPersons, input) {
    console.log(input);
    console.log(ansGraph);
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<h2>The transactions for minimum cash flow are as follows:</h2><ul>";

    for (let i = 0; i < numPersons; i++) {
        for (let j = 0; j < numPersons; j++) {
            if (i === j) continue;

            if (ansGraph[i][j].amount !== 0 && ansGraph[j][i].amount !== 0) {
                if (ansGraph[i][j].amount === ansGraph[j][i].amount) {
                    ansGraph[i][j].amount = 0;
                    ansGraph[j][i].amount = 0;
                } else if (ansGraph[i][j].amount > ansGraph[j][i].amount) {
                    ansGraph[i][j].amount -= ansGraph[j][i].amount;
                    ansGraph[j][i].amount = 0;
                    console.log(`${input[i].name} pays Rs ${ansGraph[i][j].amount} to ${input[j].name} via ${ansGraph[i][j].type}`);
                    resultsDiv.innerHTML += `<li>${input[i].name} pays Rs ${ansGraph[i][j].amount} to ${input[j].name} via ${ansGraph[i][j].type}}</li>`;                
                } else {
                    ansGraph[j][i].amount -= ansGraph[i][j].amount;
                    ansGraph[i][j].amount = 0;
                    console.log(`${input[j].name} pays Rs ${ansGraph[j][i].amount} to ${input[i].name} via ${ansGraph[j][i].type}`);
                    resultsDiv.innerHTML += `<li>${input[j].name} pays Rs ${ansGraph[j][i].amount} to ${input[i].name} via ${ansGraph[j][i].type}</li>`;
                }
            } else if (ansGraph[i][j].amount !== 0) {
                console.log(`${input[i].name} pays Rs ${ansGraph[i][j].amount} to ${input[j].name} via ${ansGraph[i][j].type}`);
                resultsDiv.innerHTML += `<li>${input[i].name} pays Rs ${ansGraph[i][j].amount} to ${input[j].name} via ${ansGraph[i][j].type}</li>`;
            } else if (ansGraph[j][i].amount !== 0) {
                console.log(`${input[j].name} pays Rs ${ansGraph[j][i].amount} to ${input[i].name} via ${ansGraph[j][i].type}`);
                resultsDiv.innerHTML += `<li>${input[j].name} pays Rs ${ansGraph[j][i].amount} to ${input[i].name} via ${ansGraph[j][i].type}</li>`;
            }

            ansGraph[i][j].amount = 0;
            ansGraph[j][i].amount = 0;
        }
    }
    resultsDiv.innerHTML += "</ul>";

}

function minimizeCashFlow(numPersons, input, indexOf, numTransactions, graph, maxNumTypes) {
    let listOfNetAmounts = Array(numPersons).fill().map(() => new Person());

    for (let p = 0; p < numPersons; p++) {
        listOfNetAmounts[p].name = input[p].name;
        listOfNetAmounts[p].types = input[p].types;

        let amount = 0;
        for (let i = 0; i < numPersons; i++) {
            amount += graph[i][p];
        }

        for (let j = 0; j < numPersons; j++) {
            amount -= graph[p][j];
        }

        listOfNetAmounts[p].netAmount = amount;
    }

    let ansGraph = Array(numPersons).fill().map(() => Array(numPersons).fill().map(() => ({ amount: 0, type: "" })));

    let numZeroNetAmounts = listOfNetAmounts.filter(person => person.netAmount === 0).length;

    while (numZeroNetAmounts !== numPersons) {
        let minIndex = getMinIndex(listOfNetAmounts, numPersons);
        let { maxIndex, matchingType } = getMaxIndex(listOfNetAmounts, numPersons, minIndex, input, maxNumTypes);

        if (maxIndex === -1) {
            ansGraph[minIndex][0].amount += Math.abs(listOfNetAmounts[minIndex].netAmount);
            ansGraph[minIndex][0].type = Array.from(input[minIndex].types)[0];

            let simpleMaxIndex = getSimpleMaxIndex(listOfNetAmounts, numPersons);
            ansGraph[0][simpleMaxIndex].amount += Math.abs(listOfNetAmounts[minIndex].netAmount);
            ansGraph[0][simpleMaxIndex].type = Array.from(input[simpleMaxIndex].types)[0];

            listOfNetAmounts[simpleMaxIndex].netAmount += listOfNetAmounts[minIndex].netAmount;
            listOfNetAmounts[minIndex].netAmount = 0;

            if (listOfNetAmounts[minIndex].netAmount === 0) numZeroNetAmounts++;
            if (listOfNetAmounts[simpleMaxIndex].netAmount === 0) numZeroNetAmounts++;
        } else {
            let transactionAmount = Math.min(Math.abs(listOfNetAmounts[minIndex].netAmount), listOfNetAmounts[maxIndex].netAmount);

            ansGraph[minIndex][maxIndex].amount += transactionAmount;
            ansGraph[minIndex][maxIndex].type = matchingType;

            listOfNetAmounts[minIndex].netAmount += transactionAmount;
            listOfNetAmounts[maxIndex].netAmount -= transactionAmount;

            if (listOfNetAmounts[minIndex].netAmount === 0) numZeroNetAmounts++;
            if (listOfNetAmounts[maxIndex].netAmount === 0) numZeroNetAmounts++;
        }
    }

    printAns(ansGraph, numPersons, input);
}
function addPersonInfo() {
    const numPersons = parseInt(document.getElementById("numPersons").value);
    const personsInfo = document.getElementById("persons-info");

    personsInfo.innerHTML = '';

    for (let i =0; i < numPersons; i++) {
        // let personInfo = document.createElement("div");
        // personInfo.classList.add("nform-group");
        if(i===0){
            personsInfo.innerHTML += `
        
            <div class="person"
                <label style="margin-bottom:5px;"><b> Central Person </b></lable>
                <label for="person${i}Name">Name</label>
                <input type="text" id="person${i}Name" required />
                <label for="person${i}Types">Payment Types (comma-separated)</label>
                <input type="text" id="person${i}Types" required />
            </div>
                `;
        }
        else{

        personsInfo.innerHTML += `
        
        <div class="person"
            <label style="margin-bottom:5px;"><b> Person ${i} </b></lable>
            <label for="person${i}Name">Name</label>
            <input type="text" id="person${i}Name" required />
            <label for="person${i}Types">Payment Types (comma-separated)</label>
            <input type="text" id="person${i}Types" required />
        </div>
            `;
        }
        // personsInfo.appendChild(personInfo);
    }
}

function addTransactionInfo() {
    const numTransactions = parseInt(document.getElementById("numTransactions").value);
    const transactionsInfo = document.getElementById("transactions-info");

    transactionsInfo.innerHTML = '';

    for (let i = 0; i < numTransactions; i++) {
        // let transactionInfo = document.createElement("div");
        // transactionInfo.classList.add("form-group");
        transactionsInfo.innerHTML += `
        <div class="transaction">
            <label><b>Transaction ${i + 1}</b></label>
            <label for="transaction${i}From"> From</label>
            <input type="text" id="transaction${i}From" required />
            <label for="transaction${i}To">To</label>
            <input type="text" id="transaction${i}To" required />
            <label for="transaction${i}Amount">Amount</label>
            <input type="number" id="transaction${i}Amount" required />
        </div>
            `;
        // transactionsInfo.appendChild(transactionInfo);
    }
}
document.getElementById("numPersons").addEventListener("change",addPersonInfo);
document.getElementById('numTransactions').addEventListener("change",addTransactionInfo);
function calculate() {
    const numPersons = parseInt(document.getElementById("numPersons").value);
    const numTransactions = parseInt(document.getElementById("numTransactions").value);

    let input = [];
    let indexOf = new Map();

    for (let i = 0; i < numPersons; i++) {
        const name = document.getElementById(`person${i}Name`).value;
        const types = new Set(document.getElementById(`person${i}Types`).value.split(',').map(type => type.trim()));
        console.log(types);
        input.push(new Person(name, 0, types));
        console.log(input);
        indexOf.set(name, i);
    }

    let graph = Array.from({ length: numPersons }, () => Array(numPersons).fill(0));

    for (let i = 0; i < numTransactions; i++) {
        const from = document.getElementById(`transaction${i}From`).value;
        const to = document.getElementById(`transaction${i}To`).value;
        const amount = parseInt(document.getElementById(`transaction${i}Amount`).value);

        let fromIndex = indexOf.get(from);
        let toIndex = indexOf.get(to);

        if (fromIndex !== undefined && toIndex !== undefined) {
            graph[fromIndex][toIndex] = amount;
        } else {
            console.log(`Invalid Person names: ${from}, ${to}`);
        }
    }

    const maxNumTypes = input[0].types.size;
    minimizeCashFlow(numPersons, input, indexOf, numTransactions, graph, maxNumTypes);
}
