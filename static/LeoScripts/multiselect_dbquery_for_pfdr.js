// Filename: multiselect_dbquery_for_pfdr.js
// Author: Tsz Chung Wong (Leo)
// Script used at: template/p-free-detergent-register.html
// Purpose: 
//     This script handles querying database.db for Phosphate_Free_Detergent_Register table
//     The query runs at document load, and each time a category button is clicked
//     The buttons themselves are not form buttons, but rather they add a invisible input tag
//         that has the value of the button.
//     toggleProdCat() toggles the "prodcat_inactive" css class on the buttons and adds/removes the
//         invisible inputs.
//     There is no "select all" button because it was too mindboggling to add that logic under
//         the addition of inactive css classes.

document.addEventListener('DOMContentLoaded', function () {
    // selectAll() is required for the server-side code to function properly
    toggleProdCat_selectAll();
    onpageload();
})

function toggleProdCat_selectAll() {
    prodcat_form = document.getElementById('prodcat_form');
    const allchoices = prodcat_form.querySelectorAll('button[name="categories"]');
    allchoices.forEach(choice => {
        const inputelement = document.createElement('input');
        inputelement.type = 'hidden';
        inputelement.name = 'categories';
        inputelement.value = choice.value;
        prodcat_form.appendChild(inputelement);
    })
}
function toggleProdCat_deselectAll() {
    prodcat_form = document.getElementById('prodcat_form');
    const inputs = prodcat_form.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.value != "PLACEHOLDER") {
            prodcat_form.removeChild(input);
        }
    })
}

function toggleProdCat(clickedbutton) {
    clickedbutton.classList.toggle('prodcat_inactive');
    prodcat_form = document.getElementById('prodcat_form');

    if (clickedbutton.classList.contains('prodcat_inactive')) {
        const inputs = prodcat_form.querySelectorAll('input[name="categories"]');
        inputs.forEach(input => {
            if (input.value === clickedbutton.value) {
                prodcat_form.removeChild(input); // Remove the input from the form
            }
        });
    } else {
        const inputelement = document.createElement('input');
        inputelement.type = 'hidden';
        inputelement.name = 'categories';
        inputelement.value = clickedbutton.value;
        prodcat_form.appendChild(inputelement);
    }
    submitform_prodcat();
}

function submitform_prodcat() {
    const prodcat_form = document.getElementById('prodcat_form');
    const formData = new FormData(prodcat_form);

    // JSONify the form
    const formObject = {};
    formData.forEach((value, key) => {
        if (!formObject[key]) {
            formObject[key] = [];
        }
        formObject[key].push(value); // Allow multiple categories
    });

    fetch('/p-free-detergent-register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formObject),
    })
        .then(response => response.json())
        .then(rows => {
            console.log("Data fetched from server (submitform_prodcat):", rows);
            updateTable(rows.data);
        })
        .catch(error => console.error('Error:', error));
}

// function onpageload() {
//         const dataFromServer = {{ rows| tojson }};
//     // You can now use JSON type 'dataFromServer' in JavaScript
//     console.log("Data fetched from server:", dataFromServer);
//     updateTable(dataFromServer)
// }

function updateTable(updatedData) {
    console.log(typeof updatedData);
    console.log(updatedData[0]);

    const resultsTable_element = document.getElementById('resultsTable');
    const resultsTable_tbody = document.getElementById('resultsTableBody');
    // Clear existing rows in table
    resultsTable_tbody.innerHTML = '';

    // Loop through the data and create a new row for each
    updatedData.forEach(item => {
        const row = document.createElement('tr');

        const idCell = document.createElement('td');
        idCell.textContent = item.prod_id;  // Adjust field names based on your data structure
        // row.appendChild(idCell);
        row.style.backgroundColor = item.prod_id % 2 === 0 ? '#f2f2f2' : '#ffffff'; // Alternate colors

        const catCell = document.createElement('td');
        catCell.textContent = item.prod_cat;
        row.appendChild(catCell);

        const brandCell = document.createElement('td');
        brandCell.textContent = item.prod_brand;
        row.appendChild(brandCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = item.prod_name;
        row.appendChild(nameCell);

        // Append the new row to the table body
        resultsTable_tbody.appendChild(row);
    })
}