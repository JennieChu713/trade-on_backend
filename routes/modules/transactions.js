import express from "express";
import Transaction from "../../models/transaction.js";

const router = express.Router();

//CREATE /deal a transaction(add userId and dealerId)
router.post("/", async (req, res) => {
  //TODO: user authentication
  const { amount, userId, dealerId, itemId } = req.body;
  try {
    const newTrans = await Transaction.create({ amount }); //Transaction.create({amount, userId, dealerId, itemId})
    if (newTrans) {
      res.status(200).json(newTrans);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all transactions
router.get("/", async (req, res) => {
  //TODO: user authentication
  try {
    const allTrans = await Transaction.find();
    if (allTrans) {
      res.status(200).json(allTrans);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ a transaction
router.get("/:id", async (req, res) => {
  // TODO: user authentication
  const { id } = req.params;
  try {
    const trans = await Transaction.findById(id);
    if (trans) {
      res.status(200).json(trans);
    } else {
      res
        .status(200)
        .json({ error: "The deal you are looking for does not exist." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE transaction - filling sending info and isFilled
router.put("/filling-info/:id", async (req, res) => {
  //TODO: user authentication
  const { id } = req.params;
  const { name, cellPhone, storeCode, storeName } = req.body;
  try {
    const dataStructure = {
      sendingInfo: {
        name,
        cellPhone,
        storeCode,
        storeName,
      },
    };
    dataStructure.isFilled = true;
    // Transaction.findByOneAndUpdate({id, userId, dealerId},dataStructure,{ runValidators: true, new: true })
    const updateProcess = await Transaction.findByIdAndUpdate(
      id,
      dataStructure,
      { runValidators: true, new: true }
    );
    if (updateProcess) {
      res.status(200).json(updateProcess);
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// UPDATE transaction - filling sending info and isFilled
router.put("/payment/:id", async (req, res) => {
  //TODO: user authentication
  const { id } = req.params;
  //TODO: if user(dealerId) does not have account information,
  const { accountName, accountNum, bankCode, bankName } = req.body;
  try {
    const checkProcess = await Transaction.findById(id);
    if (checkProcess.isFilled) {
      // const dataStructure = {
      //   account: {
      //     accountName,
      //     accountNum,
      //     bankCode,
      //     bankName,
      //   },
      // };
      const updateProcess = await Transaction.findByIdAndUpdate(
        id,
        { isPayed: true, isCancelable: false },
        { runValidators: true, new: true }
      );
      if (updateProcess) {
        res.status(200).json(updateProcess);
      }
    } else {
      return res.status(200).json({ error: "Unpermitted Process" });
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// UPDATE transaction - is sendout
router.put("/sendout/:id", async (req, res) => {
  //TODO: user authentication
  const { id } = req.params;
  try {
    const checkProcess = await Transaction.findById(id);
    if (checkProcess.isFilled && checkProcess.isPayed) {
      const updateProcess = await Transaction.findByIdAndUpdate(
        id,
        { isSent: true },
        { runValidators: true, new: true }
      );
      if (updateProcess) {
        res.status(200).json(updateProcess);
      }
    } else {
      return res.status(200).json({ error: "Unpermitted Process" });
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// UPDATE transaction - is complete
router.put("/complete/:id", async (req, res) => {
  //TODO: user authentication
  const { id } = req.params;
  try {
    const checkProcess = await Transaction.findById(id);
    if (checkProcess.isFilled && checkProcess.isPayed && checkProcess.isSent) {
      const updateProcess = await Transaction.findByIdAndUpdate(
        id,
        { isCompleted: true },
        { runValidators: true, new: true }
      );
      if (updateProcess) {
        res.status(200).json(updateProcess);
      }
    } else {
      return res.status(200).json({ error: "Unpermitted Process" });
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

export default router;
