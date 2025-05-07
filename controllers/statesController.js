const States = require('../model/States');
const fsPromises = require('fs').promises;
const path = require('path');

const getStates = async () => {
    let result;
    try {
        let fileData = await fsPromises.readFile(path.join(__dirname, '..', 'model', 'statesData.json'), 'utf8');
        const databaseResults = await States.find({ }).exec();
        fileData = JSON.parse(fileData);
        result = fileData.map((fileItem) => {
            const dbResult = databaseResults.find((dbResult) => dbResult.stateCode.toUpperCase() === fileItem.code.toUpperCase());
            if(dbResult === undefined){
                return fileItem;
            }
            return {...fileItem, funfacts: dbResult.funfacts}; 
        });
    } catch (err){
        console.error(err);
    }
    
    return result; 
}

const getAllStates = async (req, res) => {
    let result = await getStates();

    if(req.query.contig === undefined){
        res.json(result);
    }
    else if(req.query.contig.toLowerCase() === "true"){
        result = result.filter((stateInfo) => (stateInfo.code !== "HI" && stateInfo.code !== "AK"));
        res.json(result);
    }
    else if (req.query.contig.toLowerCase() === "false"){
        result = result.filter((stateInfo) => stateInfo.code === "HI" || stateInfo.code === "AK");
        res.json(result);
    }
    
}

const getState = async (req, res) => {
    let result = await getStates();

    result = result.find((stateInfo) => stateInfo.code.toLowerCase() === req.params.state.toLowerCase());

    res.json(result);
}

const getStateFunfact = async (req, res) => { 
    const funfactObject = await States.findOne({ stateCode: req.params.state.toUpperCase() }).exec();

    if (!funfactObject) {
        let result = await getStates();

        result = result.find((stateInfo) => stateInfo.code.toLowerCase() === req.params.state.toLowerCase());   
    
        return res.status(200).json({ "message": `No Fun Facts found for ${result.state}` });
    }
    let randomFunfact = Math.floor(Math.random() * funfactObject.funfacts.length);

    res.json({ funfact: funfactObject.funfacts[randomFunfact]});
}

const getStateCapital = async (req, res) => {
    let result = await getStates();

    result = result.find((stateInfo) => stateInfo.code.toUpperCase() === req.params.state.toUpperCase());

    res.json({state: result.state, capital: result.capital_city});
}

const getStateNickname = async (req, res) => {
    let result = await getStates();

    result = result.find((stateInfo) => stateInfo.code.toUpperCase() === req.params.state.toUpperCase());

    res.json({state: result.state, nickname: result.nickname});
}

const getStatePopulation = async (req, res) => {
    let result = await getStates();

    result = result.find((stateInfo) => stateInfo.code.toUpperCase() === req.params.state.toUpperCase());

    res.json({state: result.state, population: result.population.toLocaleString('en')});
}

const getStateAdmission = async (req, res) => {
    let result = await getStates();

    result = result.find((stateInfo) => stateInfo.code.toUpperCase() === req.params.state.toUpperCase());

    res.json({state: result.state, admitted: result.admission_date});
}

const postFunfact = async (req, res) => {
    if (!req?.body?.funfacts) return res.status(400).json({ 'message': 'State fun facts value required' });
    if((req.body.funfacts instanceof Array) === false) return res.status(400).json({ 'message': 'State fun facts value must be an array' });

    try {
        const funfactObject = await States.findOne({ stateCode: req.params.state.toUpperCase() }).exec();

        if (!funfactObject) {
            const result = await States.create({
                stateCode: req.params.state,
                funfacts: req.body.funfacts
            });
            res.status(201).json(result); 
        } else{
            funfactObject.funfacts.push(...req.body.funfacts);
            const result = await funfactObject.save();
            res.status(201).json(result)
        }    
        
    } catch (err) {
        console.error(err);
    }
}

const updateFunfact = async (req, res) => {
        if (!req?.body?.funfact) return res.status(400).json({ 'message': `State fun fact value required` });
    
        const funfactObject = await States.findOne({ stateCode: req.params.state.toUpperCase() }).exec();
        let result = await getStates();
        result = result.find((stateInfo) => stateInfo.code.toLowerCase() === req.params.state.toLowerCase());

        if (!funfactObject) return res.status(400).json({ "message": `No Fun Facts found for ${result.state}` });
        
        if(req.body.index > funfactObject.funfacts.length) return res.status(400).json({  "message": `No Fun Fact found at that index for ${result.state}` });
        
        funfactObject.funfacts.splice(req.body.index - 1, 1, req.body.funfact);

        const patchResult = await funfactObject.save();
        res.json(patchResult);
}

const deleteFunfact = async (req, res) => {    
    const funfactObject = await States.findOne({ stateCode: req.params.state.toUpperCase() }).exec();

    let result = await getStates();

    result = result.find((stateInfo) => stateInfo.code.toLowerCase() === req.params.state.toLowerCase());
    
    if (!funfactObject) return res.status(400).json({ "message": `No Fun Facts found for ${result.state}` });

    if(req.body.index > funfactObject.funfacts.length) return res.status(400).json({  "message": `No Fun Fact found at that index for ${result.state}` });
    
    funfactObject.funfacts.splice(req.body.index - 1, 1)
    const deleteResult = await funfactObject.save();
    res.json(deleteResult);
}

module.exports = { getAllStates, getState, getStateFunfact, getStateCapital, getStateNickname, getStatePopulation, getStateAdmission, postFunfact, updateFunfact, deleteFunfact };