import mongoose from "mongoose";
import createDynamicModel from "../models/modelFournisseur.js";
import ListFourn from "../models/modelListFourn.js";

export const getFournisseurs = async (req, res) => {
  try {
    const fournisseurs = await ListFourn.find({ fieldNames: { $ne: [] } });
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.status(200).send(fournisseurs);
    console.log(fournisseurs);
  } catch (err) {
    console.error("Erreur lors de la récupération des fournisseurs :", err);
    res
      .status(500)
      .send({
        message:
          "Une erreur s'est produite lors de la récupération des fournisseurs",
      });
  }
};

export const reSaveFournisseur = async (req, res) => {
  try {
  } catch (error) {}
};

export const saveFournisseur = async (req, res) => {
  const { collectionName, data, updatedKeyNames } = req.body;

  const keys = data.reduce((keys, obj) => {
    Object.keys(obj).forEach((key) => {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    });
    return keys;
  }, []);

  // Ceci est le shema dynamicModel avec la fonction createDynamiqueModel pour avoir
  const Fournisseur = createDynamicModel(collectionName, keys);

  const createListFourn = async () => {
    try {
      const fourn = {
        collectionName: collectionName,
        fieldNames: keys,
        updatedKeyNames: updatedKeyNames,
      };
      const listFourn = new ListFourn(fourn);

      await listFourn.save();
      console.log(fourn);
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde de la listeCollection :",
        error
      );
    }
  };

  try {
    // Supprimer les anciennes données de la collection
    await Fournisseur.deleteMany();

    // Insérer les nouvelles données dans la collection
    await Fournisseur.create(data);
    //recreer la collection listFourn
    await createListFourn();

    console.log("Données sauvegardées dans la collection :", collectionName);
    res.sendStatus(200);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de fournisseurs new :", error);
    res.sendStatus(500);
  }
};

export default { saveFournisseur, getFournisseurs };
