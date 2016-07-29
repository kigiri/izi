const ava = require('ava')
require('test-mirror')({
  args: {},
  /* Object: this will be the first argument of each test
   * If you don't specify it, it default to containing assert
   * If you are in a mocha environnement,
   * it is populated with all the mocha globals
   */
 
  ignoreNotFound: false,
  /* if true, Silently ignore file if no tests are found
   * default to false
   */
 
  match: /((?!\.spec).)+\.js$/,
  /* a RegExp or function that is apply to the resolved filename of the module
   * default to only .js file
   */
 
  rootPath: __dirname + '/..',
  /* String: default to the project parent folder
   */
 
  srcPath: 'core',
  /* String: directory containing the module file to test, default to 'core'.
   * Relative to the rootPath.
   */
 
  testPath: 'test',
  /* String: directory mirroiring the srcPath, default to 'test'.
   * Relative to the rootPath.
   */
 
  suffix: '.spec',
  /* String: suffix for test files, for differenciating files in editors,
   * default to '.spec'.
   */
 
  forceSync: true,
  /* Boolean: force to build tests synchronously.
   */
 
  wrapper: (context, test, mod) => {
    // here is an using ava, test must be synchronous 
    ava('Testing module '+ context.name, t => test(t, mod))
  }
  /* Function: context to call each tests.
   * The context field contains : 
      - name (String) : name of the module
      - srcPath (String) : path of the tested module
      - testPath (String) : path of the test file
 
   * There is a default function build for mocha, it's only here if you need to
   * override it, or make it work for another environnement
   */
})