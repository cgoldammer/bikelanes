const s3Stub = 'https://bikelanepictures.s3.amazonaws.com/'
const getS3Location = filename => s3Stub + filename + '.jpg'

const displayTable = (json) => {
    console.log("parsing")
    const laneTypes = ['standard', 'sharrow', 'parkway', 'white_separation']
    const laneTypeFields = laneTypes.map(laneType => `bike_${laneType}`)
    const numericCols = [...laneTypeFields, ...laneTypeFields.map(laneType => `${laneType}_clip`)].sort()
    
    const jsonRowFields = ['filename', ...numericCols]

    const table = document.querySelector('#table');
    table.innerHTML = '';

    /* The table displayes the image in one column andthe two predictions in the other two columns */
    const headerRow = document.createElement('tr');
    table.appendChild(headerRow);
    const headerImage = document.createElement('th');
    headerImage.innerHTML = 'Image';
    headerRow.appendChild(headerImage);
    numericCols.forEach(field => {
        const header = document.createElement('th');
        header.innerHTML = field.replace('bike_', '').replace('_clip', '_prediction');

        headerRow.appendChild(header);
    });

    json.forEach(row => {
        const tableRow = document.createElement('tr');
        table.appendChild(tableRow);

        const imageCell = document.createElement('td');
        tableRow.appendChild(imageCell);
        const image = document.createElement('img');
        image.src = getS3Location(row.filename);
        image.width = 200;

        imageCell.appendChild(image);

        jsonRowFields.filter(f => f != 'filename').forEach(field => {
            const cell = document.createElement('td');
            cell.innerHTML = row[field];
            const val = row[field]

            if (field.includes('clip')){
                /* Display as integer percentage by multiplying by 100 first */
                cell.innerHTML = Math.round(val * 100) + '%';
            } 
            else {
                /* Display as integer */
                cell.innerHTML = val;
            }


            tableRow.appendChild(cell);
        });
    }
    );

    /* Add a table border for each cell */
    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        cell.style.border = '1px solid gray';
    });
    const cells2 = document.querySelectorAll('th');
    cells2.forEach(cell => {
        cell.style.border = '1px solid gray';
    });

    
}

console.log("SOMETHING")


fetch('clip_predictions.json')
    .then((response) => response.json())
    .then((json) => displayTable(json));
