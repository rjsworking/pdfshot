#!/usr/bin/env node

// https://www.bannerbear.com/blog/how-to-convert-html-into-pdf-with-node-js-and-puppeteer/

// https://blog.logrocket.com/building-typescript-cli-node-js-commander
// https://www.npmjs.com/package/commander#commanderjs

const { Command } = require( "commander" );
const figlet = require( "figlet" );
const puppeteer = require( 'puppeteer-core' );
const program = new Command();

program
   .configureOutput( {
      outputError: ( str: string, write: any ) => write( msg( str, 1 ) )
   } )
   .description( "Generate pdf file from url" )
   .name( 'pdf' )
   .usage( 'filename url [options]' )
   .argument( '<filename>', 'PDF file name' )
   .argument( '<url>', 'URL to print' )
   .version( '0.0.1', '-v, --version', 'Output the current version' )
   .helpOption( '-?, --help', 'Display information' )
   .showHelpAfterError()
   .parse( process.argv );

( async () => {
   // console.log(cmdOptions)
   console.log( msg( figlet.textSync( "PDFSHOT" ), 2 ) );
   console.log( "" )
   console.log( msg( "Printing " + program.args[ 0 ] + " from " + program.args[ 1 ], 1 ) )
   console.log( "" )
   console.log( "" )

   let options = {
      headless: true,
      devtools: false,
      defaultViewport: {
         width: 1920,
         height: 1080,
         devicePixelRatio: 1
      },
      ignoreHTTPSErrors: true,
      executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",

      "args": [
         "--window-size=1920,1080",
         '--use-gl=swiftshader',
         '--aggressive-cache-discard',
         '--disable-cache',
         '--disable-application-cache',
         '--disable-offline-load-stale-cache',
         '--disable-gpu-shader-disk-cache',
         '--media-cache-size=0',
         '--disk-cache-size=0',
         // Windows NUL: equivalent to /dev/null
         '--disk-cache-dir=NUL:',
         '--media-cache-dir=NUL:',

         // https://stackoverflow.com/questions/60786130/puppeteer-chrome-cache-dir-with-dev-null-is-creating-a-folder-dev-null-instead
      ]
   }

   // Create a browser instance
   const browser = await puppeteer.launch( options );

   // Create a new page
   const page = await browser.newPage();

   // Website URL to export as pdf
   const website_url = program.args[ 1 ];

   // Open URL in current page
   await page.goto( website_url, { waitUntil: 'networkidle0' } );

   //To reflect CSS used for screens instead of print
   await page.emulateMediaType( 'screen' );

   const newInnerHTML: string = `<div style="display: block; font-size: 16px; background-color: white; color: blue"><p><br>${website_url}<br><br></p></div>`

   await page.evaluate( ( newInnerHTML:string ) => {
      const dom = document.body
      dom.innerHTML = newInnerHTML + dom.innerHTML
   }, newInnerHTML );

   // Downlaod the PDF
   const pdf = await page.pdf( {
      path: program.args[ 0 ],
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      printBackground: true,
      format: 'A4',
   } );

   // Close the browser instance
   await browser.close();

   console.log( msg( "Done!", 2 ) )
} )();

function msg( msg: string, severity = 0 ) {
   // 0.red 1.yellow 2.green 3.blue
   let color = [ "31m", "33m", "32m", "34m" ]
   return '\x1b[' + color[ severity ] + msg + '\x1b[0m';
}

export { };
