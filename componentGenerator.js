const generateComponent = (masterLayout, components) => {
  const name = masterLayout.componentName;
  let optList = masterLayout.componentList.filter(
    (comp) =>
      comp.type == "RadioButton" ||
      comp.type == "DropDown" ||
      comp.type == "CheckBox"
  );

  let chartCmpList = masterLayout.componentList.filter(
    (comp) => comp.type == "Chart"
  );

  let tableDataApi = masterLayout.componentList.filter(
    (comp) => comp.type == "Table"
  );
  console.log(tableDataApi);

  let dateComp = masterLayout.componentList.filter(
    (comp) => comp.type == "DatePicker"
  );
  let searchFieldComp = masterLayout.componentList.filter(
    (comp) => comp.type == "SearchField"
  );

  let componentOptions = {},
    initialValues = {},
    chartData = "";

  optList.forEach((comp) => {
    initialValues[comp.attributes.id] = "";
    componentOptions[comp.attributes.id + "Options"] =
      comp.attributes.options.split(",");
  });

  const materialPicker = components.filter((comp) => comp.compPickerName);
  const materialComponents = components.filter(
    (comp) => comp.compName && comp.compName !== "Chart"
  );
  let jsxCode = "";

  if (chartCmpList && chartCmpList.length > 0) {
    chartCmpList.forEach((comp) => {
      let options = comp.attributes.options ? comp.attributes.options : "";
      chartData =
        chartData +
        `let ${comp.attributes.type}ChartData = JSON.parse(${JSON.stringify(
          comp.attributes.data
        )})
      let ${comp.attributes.type}ChartOptions = JSON.parse(${JSON.stringify(
          options
        )})
       `;
    });
    jsxCode = `import { ${[
      ...new Set(chartCmpList.map((comp) => comp.attributes.type)),
    ].join(", ")} } from 'react-chartjs-2';\n`;
  }

  if (dateComp && dateComp.length > 0) {
    jsxCode =
      jsxCode +
      `import { ${[
        ...new Set(materialPicker.map((comp) => comp.compPickerName)),
      ].join(", ")} } from '@material-ui/pickers';\n
    import DateFnsUtils from "@date-io/date-fns";\n`;
  }

  if (searchFieldComp && searchFieldComp.length > 0) {
    jsxCode = jsxCode + `import SearchIcon from '@material-ui/icons/Search';\n`;
  }
  jsxCode =
    jsxCode +
    `import {useState, useEffect} from 'react';
    import { ${[
      ...new Set(materialComponents.map((comp) => comp.compName)),
    ].join(", ")} } from '@material-ui/core';
    import './App.css';
   let componentOptions = ${JSON.stringify(componentOptions)} 
   ${chartData}  

 const ${name} = () => {
  let initialValues = ${JSON.stringify(initialValues)}
  const [values, setValues] = useState(initialValues);
  const [tableColumns, setTableColumns] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  useEffect(() => {
    fetch("${tableDataApi[0].attributes.api}")
      .then((response) => response.json())
      .then((data) => {
        setTableColumns(data.columns);
        setTableRows(data.rows);
      });
  }, []); 
  return (
    <div> 
      <Container maxWidth="lg"> 
      <Paper variant="outlined"> 
      <Grid container alignItems="center" className="wrapper">        
        ${components.map((comp) => `${comp.jsx}`).join("\n")}
      </Grid>
      </Paper>
      </Container>
    </div>
  )
}
export default ${name}`;

  return jsxCode;
};

// fs.writeFile(path.join(__dirname, `${name}.js`), jsxCode, (err) => {
//     // throws an error, you could also catch it here
//     if (err) throw err;

//     // the file was saved
//     console.log('file contents written');
//   })

module.exports = { generateComponent };
