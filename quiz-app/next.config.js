module.exports = {
    webpack: (config) => {
        return Object.assign({}, config, {
            node: {
                fs: 'empty'
            }
        })
    },
};