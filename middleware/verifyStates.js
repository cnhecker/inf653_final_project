const fsPromises = require('fs').promises;
const path = require('path');

const verifyStates = () => {
    return async (req, res, next) => {
        if (!req?.params?.state) return res.status(400).json({ 'message': 'State Code required' });
        let fileData = await fsPromises.readFile(path.join(__dirname, '..', 'model', 'statesData.json'), 'utf8');
        fileData = JSON.parse(fileData);
        const stateCodes = fileData.map((fileItem) => {
            return fileItem.code;
        });
        const result = stateCodes.find((stateCode) => stateCode.toUpperCase() === req.params.state.toUpperCase());
        if (!result) return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });
        next();
    }
}

module.exports = verifyStates