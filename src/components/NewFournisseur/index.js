import { useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import {
  TextField,
  FormHelperText,
  Grid, 
  Button,
  Typography,
  Container,
  Box,
} from "@mui/material";
import Loading from "../Loading";
import NameChamp from "./NameChamp";
import { useNavigate } from "react-router-dom";
 
const NewFournisseur = () => {
  const [fileNew, setFileNew] = useState([]);
  const [dataNew, setDataNew] = useState([]);
  const [keyNamesNew, setKeyNamesNew] = useState([]);
  //objet modifiedNames et l'object ou son regrouper les changement
  //de keyName du menu deroulant avec l'index du changement qui est
  //en fonction de l'index qui recoit du mapim de keyNames sans le reste de keyNames
  const [modifiedNames, setModifiedNames] = useState({});
  //data avec modif des champs
  const [updatedData, setUpdatedData] = useState([]);
  const [nameCollect, setNameCollect] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const nameFourn = e.target.value;
    console.log(nameFourn);
    setNameCollect(nameFourn);
  };

  const handleS = (collectName) => {
    if (collectName.endsWith("s")) {
      return collectName;
    } else {
      return collectName + "s";
    }
  };
  //fonction qui set la const ModifiedNames avec l'index du keyNames map
  //et la value du select
  const handleNameChange = (e, index) => {
    const { value } = e.target;
    setModifiedNames((prevNames) => {
      const updatedNames = { ...prevNames };
      if (value === "") {
        delete updatedNames[index];
      } else {
        updatedNames[index] = value;
      }
      return updatedNames;
    });
    console.log("modifiedNames :", modifiedNames);
  };

  //fonction qui fais les changement des keyName avec le modifiedNames
  const handleSave = async () => {
    try {
      setIsLoading(true);
      const resultName = handleS(nameCollect);

      console.log("azerty", resultName);

      const upKeyNames = keyNamesNew.map((keyName, index) => {
        if (modifiedNames.hasOwnProperty(index)) {
          return modifiedNames[index];
        }
        return keyName;
      });

      const updateDatascop = dataNew.map((item) => {
        const updatedItem = {};
        Object.keys(item).forEach((key, index) => {
          const updatedKey = upKeyNames[index];
          if (updatedKey) {
            updatedItem[updatedKey] = item[key];
          }
        });
        upKeyNames.forEach((updatedKey, index) => {
          if (updatedKey === "non_necessaire") {
            delete updatedItem[index]; // Supprimer la clé
            delete updatedItem[updatedKey]; // Supprimer la valeur correspondante
          }
        });
        return updatedItem;
      });
      setUpdatedData(updateDatascop);
      console.log("upKeyNames :", upKeyNames);

      // Appel à l'API pour sauvegarder les données
      await axios.post("https://pim-nyun.onrender.com/api/fournisseur/new", {
        collectionName: resultName,
        data: updateDatascop,
        fieldNames: upKeyNames,
      });


      const result = await axios.post(
          "https://pim-nyun.onrender.com/fournisseur/newFourn",
          {
            collectionName: resultName,
            fieldNames: upKeyNames,
          }
        );
        setIsLoading(false);

        console.log("result newfourn :", result);
        navigate(-1);

        console.log("Données sauvegardées avec succès dans listFourn!");
     
      
      console.log("Données sauvegardées avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données :", error);
    }

    console.log(updatedData);
    console.log("Data  :", dataNew);
    console.log("keyNames :", keyNamesNew);
    console.log("Data mis à jour :", updatedData);
  };

  //fonction pour upload le fichier csv grace a papaparse
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFileNew(file);
    console.log(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      const decoder = new TextDecoder("iso-8859-1");
      const fileContent = decoder.decode(content);

      const stringWithoutAccents = fileContent
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      Papa.parse(stringWithoutAccents, {
        header: true,
        encoding: "UTF-8",
        skipEmptyLines: true,
        worker: true,

        complete: (results) => {
          const dataNoFilter = results.data;
          // Filtrer les objets où 'sku' est vide
          let filteredData = [];
          if (dataNoFilter) {
            filteredData = dataNoFilter.filter((item) => {
              for (let key in item) {
                if (item.hasOwnProperty(key) && item[key] === "") {
                  return false;
                }
              }
              return true;
            });
            setDataNew(filteredData);
          }
          //nom des proprieter
          const propertyNames =
            filteredData.length > 0 ? Object.keys(filteredData[0]) : [];
          setKeyNamesNew(propertyNames);

          console.log("donne filtrer :", filteredData);
          console.log("nom de key :", propertyNames);
        },
        error: (error) => {
          console.error("Erreur lors de l'analyse du fichier CSV :", error);
        },
      });
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <Container maxWidth="md">
          {keyNamesNew.length === 0 ? (
            <Box sx={{ textAlign: "center" }}>
              <div>
                <label htmlFor="file-upload">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="contained"
                    component="span"
                    sx={{
                      borderRadius: "20px",
                      backgroundColor: "#82CEF9",
                      color: "white",
                    }}
                  >
                    <div>Choose File</div>
                  </Button>
                </label>
              </div>
            </Box>
          ) : (
            <>
            <Box sx={{ marginBottom: 2, textAlign: "center" }}>
              <Button
                variant="outlined"
                component="span"
                sx={{
                  borderRadius: "20px",
                  backgroundColor: "#82CEF9",
                  fontFamily: "cursive",
                  color: "white",
                  "&:hover": {
                    color: "#82CEF9",
                  },
                }}
              >
                {fileNew.name}
              </Button>
            </Box>
          

          <Grid container>
            <Grid
              item
              xs={12}
              sm={12}
              sx={{ textAlign: "center", marginTop: 3 }}
            >
              <Typography variant="h5" color={"#82CEF9"} fontFamily={"cursive"}>
                Liste des champs du fichier CSV importer
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              x={{ textAlign: "center", marginBottom: 3 }}
            >
              <Box
                component="form"
                sx={{
                  //fontFamily:"cursive",
                  "& > :not(style)": { m: 1, width: "25ch" },
                }}
                noValidate
                autoComplete="off"
                onChange={(e) => handleChange(e)}
              >
                <TextField
                  id="filled-search"
                  label="nom du fournisseur"
                  variant="standard"
                  size="small"
                  sx={{
                    color: "#82CEF9 !important", // Changer la couleur du texte ici
                    "& .MuiInputLabel-root": {
                      color: "#82CEF9 !important", // Changer la couleur du label ici
                    },
                    "& .MuiInputBase-input": {
                      color: "#82CEF9 !important", // Changer la couleur de l'input ici
                    },
                    "& .MuiInput-underline:after": {
                      borderBottomColor: "#82CEF9 !important", // Changer la couleur de la barre du bas
                    },
                    "& .Mui-focused": {
                      color: "#82CEF9 !important", // Changer la couleur lorsque le champ est en focus
                      "& .MuiInputLabel-root": {
                        color: "#82CEF9 !important", // Changer la couleur du label lorsque le champ est en focus
                      },
                    },
                  }}
                />
                <FormHelperText
                  id="component-helper-text"
                  sx={{
                    marginTop: "0 !important",
                    fontFamily: "cursive",
                    color: "#82CEF9",
                  }}
                >
                  Mettre que des minuscules
                </FormHelperText>
              </Box>
            </Grid>

            {keyNamesNew.map((keyName, index) => (
              <>
                {console.log("liste modifiedNames objet:", modifiedNames)}
                {console.log("liste updateData array:", updatedData)}

                <NameChamp
                  keyName={keyName}
                  index={index}
                  onNameChange={handleNameChange}
                  modifiedNames={modifiedNames}
                />
              </>
            ))}
            <Grid
              item
              xs={12}
              sm={14}
              sx={{ textAlign: { sm: "center" }, mt: 5 }}
            >
              <Button onClick={handleSave}>sauvgarder</Button>
            </Grid>
          </Grid>
          </>
)}
          {console.log(updatedData)}
        </Container>
      )}
    </>
  );
};
export default NewFournisseur;
