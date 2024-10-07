// Filename: OFF_api_for_product_lookup.js
// Author: Tsz Chung Wong (Leo)
// Script used at: template/product_lookup.html
// Purpose: 
//     This script handles sending GET request to Open Food Facts (OFF) APIs,
//     by sending a POST request to flask and letting flask handle the GET.
//     APIv1 handles keyword searches, APIv2 handles barcode searches.
//         API v2
//         https://world.openfoodfacts.net/api/v2/product/{barcode}
//         (Barcode Search returns all details of the product)
//             OR
//         API v1
//         https://world.openfoodfacts.net/cgi/search.pl?search_terms={keyword}&search_simple=1&action=process&json=1
//         search?countries_tags_en=australia&fields=code%2Cproduct_name%2Cimage_front_url&sort_by=product_name&page=1&page_size=20
//         (Search word, can choose fields to return, and can filter before getting results)

document.addEventListener('DOMContentLoaded', function () {
    const scanBarcodeBtn = document.getElementById('product-barcode-scan-button');
    const stopBarcodeBtn = document.getElementById('product-barcode-stop-button');
    const barcodeInput = document.getElementById('barcode');
    const searchForm = document.getElementById('product-search-form');
    const videoElement = document.getElementById('video-preview');
    const barcodeScanningBlock = document.getElementById('barcode-scanning-block');
    const scanResult = document.getElementById('barcode-result');
    const barcodeStorage = document.getElementById('barcode');
    const resultsDiv = document.getElementById('api-result');
    const loadingLogo = document.getElementById('loading-logo');

    let isScanning = false;
    let mediaStream = null;

    function startCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                mediaStream = stream;
                videoElement.srcObject = stream;
            })
            .catch(err => {
                console.error('Error accessing the camera: ', err);
            });
    }

    function stopCamera() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
            mediaStream = null;
        }
    }

    function stopQuagga() {
        Quagga.stop();
        stopCamera();
        isScanning = false;
        barcodeScanningBlock.style.display = "none";
        scanBarcodeBtn.style.display = "block";
        stopBarcodeBtn.style.display = "none";
    }

    function submitFormData(requestData) {
        fetch('/product-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        })
            .then(response => response.json())
            .then(external_data => {

                console.log(external_data);  // Logs the full object to the console

                console.log(external_data.message);

                loadingLogo.style.display = "none";

                // Check if the search was successful based on the content or status of the external_data
                if (external_data.data) {
                    let htmlContent = '';

                    // Loop through each product in the external_data array
                    external_data.data.products.forEach(product => {
                        const productName = product.product_name || 'No product name available';
                        const ingredientsText = product.ingredients_text || 'No ingredients information available';
                        const imageUrl = product.image_front_url || '';
                        // Check for nitrate or phosphate in the ingredients text
                        const containsNitrate = /nitrate/i.test(ingredientsText);
                        const containsPhosphate = /phosphate/i.test(ingredientsText);

                        let productNitrateOrPhosphate = '';
                        if (containsNitrate && containsPhosphate) {
                            productNitrateOrPhosphate = '<span class="red-circle"></span>Contains both nitrate and phosphate';
                        } else if (containsNitrate) {
                            productNitrateOrPhosphate = '<span class="yellow-circle"></span>Contains nitrate';
                        } else if (containsPhosphate) {
                            productNitrateOrPhosphate = '<span class="yellow-circle"></span>Contains phosphate';
                        } else if (ingredientsText != 'No ingredients information available') {
                            productNitrateOrPhosphate = '<span class="green-circle"></span>Does not contain nitrate or phosphate';
                        }

                        htmlContent += `
                            <div class="product">
                                <div class="product-left">
                                    ${imageUrl ? `
                                        <div class="product-image">
                                            <img src="${imageUrl}" alt="${productName}" />
                                        </div>
                                    ` : `
                                        <div class="product-image">
                                            <p>No image found</p>
                                        </div>
                                    `}
                                </div>
                                <div class="product-right">
                                    <div class="product-name">
                                        <h2>${productName}</h2>
                                    </div>
                                    <div class="product-ingredients">
                                        <p>${ingredientsText}</p>
                                    </div>
                                    ${productNitrateOrPhosphate ? `
                                        <div class="product-nitrate-or-phosphate">
                                            <p>${productNitrateOrPhosphate}</p>
                                        </div>
                                    ` : `<div class="product-nitrate-or-phosphate">
                                            <p><span class="grey-circle"></span> Information not found</p>
                                        </div>
                                    `}
                                </div>
                            </div>
                        `;
                    });

                    // Insert the constructed HTML into the resultsDiv
                    resultsDiv.innerHTML = htmlContent;
                } else {
                    // If no data was returned, display an appropriate message
                    resultsDiv.innerHTML = '<p>No products found or data is missing.</p>';
                }
            })
            .catch(error => {
                resultsDiv.innerHTML = '<p>Error: ' + error.message + '<br>Please check you are searching for English words or have scanned a barcode</p>';
            });
    }

    function initQuagga() {
        startCamera();

        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: videoElement,
            },
            decoder: {
                readers: ["code_128_reader"]
            }
        }, function (err) {
            if (err) {
                console.error("Quagga initialization error: ", err);
                return;
            }
            console.log("Quagga initialized successfully.");
            Quagga.start();
        });

        Quagga.onDetected(function (data) {
            barcodeInput.value = data.codeResult.code;
            scanResult.textContent = data.codeResult.code;
            barcodeStorage.value = data.codeResult.code;
            stopQuagga();
            const requestData = {
                barcode: data.codeResult.code,
                keyword: document.querySelector('input[name="keyword"]').value,
                barcode_url: 'https://world.openfoodfacts.org/api/v2/product/' + encodeURIComponent(data.codeResult.code),
                keyword_url: 'https://world.openfoodfacts.org/cgi/search.pl?search_terms='
                    + encodeURIComponent(document.querySelector('input[name="keyword"]').value)
                    + '&search_simple=1&action=process&json=1&countries_tags_en=australia&fields=code%2Cproduct_name%2Cimage_front_url%2Cingredients_text',
                userAgent: navigator.userAgent
            };
            loadingLogo.style.display = "block";
            submitFormData(requestData);
        });
    }

    function handleButtonClick() {
        const requestData = {
            keyword: document.querySelector('input[name="keyword"]').value,
            barcode: document.querySelector('input[name="barcode"]').value,
            barcode_url: 'https://world.openfoodfacts.org/api/v2/product/' + encodeURIComponent(document.querySelector('input[name="barcode"]').value),
            keyword_url: 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(document.querySelector('input[name="keyword"]').value) + '&search_simple=1&action=process&json=1&countries_tags_en=australia&fields=code%2Cproduct_name%2Cimage_front_url%2Cingredients_text',
            userAgent: navigator.userAgent
        };
        loadingLogo.style.display = "block";
        submitFormData(requestData);
    }

    scanBarcodeBtn.addEventListener('click', function () {
        if (!isScanning) {
            isScanning = true;
            barcodeScanningBlock.style.display = "block";
            scanBarcodeBtn.style.display = "none";
            stopBarcodeBtn.style.display = "block";
            initQuagga();
        }
    });

    stopBarcodeBtn.addEventListener('click', function () {
        stopQuagga();
    });

    document.getElementById('product-name-search-button').addEventListener('click', function (event) {
        event.preventDefault();
        handleButtonClick();
    });
});