
const modules = ['uuid', 'd3', 'internmap', 'd3-.*', 'delaunator',
  'robust-predicates', '@mui', '@babel', 'undici'
];

const ignorePatterns = `node_modules/(?!((${modules.join('|')}))/)`;



module.exports = {
  setupFiles: ['./jest.polyfills.js'],
  verbose: true,
  testEnvironment: "jest-environment-jsdom",
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  setupFilesAfterEnv: [
  "<rootDir>/src/jsdomSetup.js", "<rootDir>/jest.setup.js"
  ],
  transform: {
    '^.+\\.(t|j)sx?$': [
      "@swc/jest",
      {
          "jsc": {
              "parser": {
                  "syntax": "ecmascript",
                  "jsx": true,
                  "decorators": false,
                  "dynamicImport": false
              }
          }
      },
  ],
  },
  transformIgnorePatterns: [ignorePatterns],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  };
