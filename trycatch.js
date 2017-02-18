const trycatch = fn => { try { return fn() } catch (err) { return err } }
trycatch.mute = fn => { try { return fn() } catch (err) {} }

module.exports = trycatch
