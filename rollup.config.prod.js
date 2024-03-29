import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-delete';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import svgo from 'rollup-plugin-svgo';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const outputDir = './dist/';

const banner = `/* **********************************
MJS Diagram version ${pkg.version}
https://markerjs.com

copyright Alan Mendelevich
see README.md and LICENSE for details
********************************** */`;

export default [
  // types
  {
    input: [
      './src/core.ts',
      './src/viewer.ts',
      './src/editor.ts',
      './src/index.ts',
    ],
    output: {
      dir: './dts/',
    },
    external: ['@markerjs/mjs-toolbar'],    
    plugins: [
      del({ targets: ['dts/*', 'dist/*'] }),
      nodeResolve(),
      typescript({
        declaration: true,
        outDir: './dts/',
        rootDir: './src/',
        exclude: ['./test/**/*', './dts/**/*', './dist/**/*'],
      }),
      svgo(),
    ],
  },
  {
    input: './dts/core.d.ts',
    output: [{ file: './dist/core.d.ts', format: 'es' }],
    external: [/^(\.\.?\/)*editor$/, /^(\.\.?\/)*viewer$/, '@markerjs/mjs-toolbar'],
    plugins: [dts()],
  },
  {
    input: './dts/viewer.d.ts',
    output: [{ file: './dist/viewer.d.ts', format: 'es' }],
    external: [/^(\.\.?\/)*core$/, /^(\.\.?\/)*editor$/, '@markerjs/mjs-toolbar'],
    plugins: [dts()],
  },
  {
    input: './dts/editor.d.ts',
    output: [{ file: './dist/editor.d.ts', format: 'es' }],
    external: [/^(\.\.?\/)*core$/, /^(\.\.?\/)*viewer$/, '@markerjs/mjs-toolbar'],
    plugins: [dts()],
  },
  {
    input: './dts/index.d.ts',
    external: ['@markerjs/mjs-toolbar'],    
    output: [{ file: outputDir + pkg.types, format: 'es' }],
    plugins: [dts()],
  },

  // main modules
  {
    input: 'src/core.ts',
    output: [
      {
        file: outputDir + 'core.js',
        format: 'es',
        sourcemap: true,
        banner: banner,
      },
    ],
    plugins: [
      typescript({
        compilerOptions: {
          rootDir: './src/',
        },
      }),
      svgo(),
      terser(),
    ],
  },
  {
    input: ['src/viewer.ts'],
    output: [
      {
        file: outputDir + 'viewer.js',
        format: 'es',
        sourcemap: true,
        banner: banner,
      },
    ],
    external: [/^(\.\.?\/)*core$/, '@markerjs/mjs-toolbar'],
    plugins: [
      //nodeResolve(),
      typescript({
        compilerOptions: {
          rootDir: './src/',
        },
      }),
      svgo(),
      terser(),
    ],
  },
  {
    input: ['src/editor.ts'],
    output: [
      {
        file: outputDir + 'editor.js',
        format: 'es',
        sourcemap: true,
        banner: banner,
      },
    ],
    external: [/^(\.\.?\/)*core$/, '@markerjs/mjs-toolbar'],
    plugins: [
      //nodeResolve(),
      typescript({
        compilerOptions: {
          rootDir: './src/',
        },
      }),
      svgo(),
      terser(),
    ],
  },

  // mindmap
  ...getStencilSetBundleConfig('mindmap'),

  // flowchart
  ...getStencilSetBundleConfig('flowchart'),

  // network diagram
  ...getStencilSetBundleConfig('network'),

  // orgchart
  ...getStencilSetBundleConfig('orgchart'),

  // complete UMD package
  {
    input: ['src/index.ts'],
    output: [
      {
        file: outputDir + pkg.main,
        name: 'mjsdiagram',
        format: 'umd',
        sourcemap: true,
        banner: banner,
      },
    ],
    plugins: [nodeResolve(), typescript(), svgo(), terser()],
  },

  // complete ESM package
  {
    input: ['src/index.ts'],
    output: [
      {
        file: outputDir + pkg.module,
        format: 'es',
        sourcemap: true,
        banner: banner,
      },
    ],
    external: ['@markerjs/mjs-toolbar'],    
    plugins: [
      //nodeResolve(),
      typescript(),
      svgo(),
      terser(),
      generatePackageJson({
        baseContents: (pkg) => {
          pkg.scripts = {};
          pkg.dependencies = {
            "@markerjs/mjs-toolbar": "^0.2.3"
          };
          pkg.devDependencies = {};
          return pkg;
        },
      }),
      copy({
        targets: [
          {
            src: 'README.md',
            dest: 'dist',
          },
          {
            src: 'LICENSE',
            dest: 'dist',
          },
        ],
      }),
      // del({ targets: ['dts/*'] }),
    ],
  },
];

function getStencilSetBundleConfig(name) {
  return [
    {
      input: [`./src/stencilsets/${name}/${name}.ts`],
      output: {
        dir: `./dts/stencilsets/${name}/`,
      },
      external: [/^(\.\.?\/)*core$/, /^(\.\.?\/)*editor$/, /^(\.\.?\/)*viewer$/],
      plugins: [
        nodeResolve(),
        typescript({
          declaration: true,
          outDir: `./dts/stencilsets/${name}/`,
          rootDir: './src/',
          exclude: ['./test/**/*', './dts/**/*', './dist/**/*'],
        }),
        svgo(),
      ],
    },
    {
      input: `./dts/stencilsets/${name}/${name}.d.ts`,
      output: [{ file: `./dist/stencilsets/${name}/${name}.d.ts`, format: 'es' }],
      external: [/^(\.\.?\/)*core$/, /^(\.\.?\/)*editor$/, /^(\.\.?\/)*viewer$/],
      plugins: [dts()],
    },
    {
      input: [`./src/stencilsets/${name}/${name}.ts`],
      output: [
        {
          file: outputDir + `stencilsets/${name}/${name}.js`,
          format: 'es',
          sourcemap: true,
          banner: banner,
        },
      ],
      external: [/^(\.\.?\/)*core$/, /^(\.\.?\/)*editor$/, /^(\.\.?\/)*viewer$/],
      plugins: [
        typescript({
          compilerOptions: {
            rootDir: './src/',
          },
        }),
        svgo(),
        terser(),
      ],
    },
  ]
}
