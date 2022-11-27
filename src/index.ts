#!/usr/bin/env node

// https://www.bannerbear.com/blog/how-to-convert-html-into-pdf-with-node-js-and-puppeteer/

// https://blog.logrocket.com/building-typescript-cli-node-js-commander
// https://www.npmjs.com/package/commander#commanderjs

const os = require( 'node:os' );
const { Command } = require( "commander" );
const figlet = require( "figlet" );
const puppeteer = require( 'puppeteer-core' );
const program = new Command();

type opts = Record<any, any>

const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"

// EDGE EXTENSIONS
// C:\Users\xolid70\AppData\Local\Microsoft\Edge\User Data\Default\Extensions

const noads = require( 'path' ).join( __dirname, '../src/extensions/odfafepnkmbhccpbejgmiehpchacaeak/' )
const nocookies = require( 'path' ).join( __dirname, '../src/extensions/oholpbloipjbbhlhohaebmieiiieioal/' )

const scrollToBottom = require( "scroll-to-bottomjs" );

program
    .configureOutput( {
        outputError: ( str: string, write: any ) => write( msg( str, 1 ) )
    } )
    .description( "Generate pdf file from url" )
    .name( 'pdf' )
    .usage( 'filename url [options]' )
    .argument( '<filename>', 'PDF file name' )
    .argument( '<url>', 'URL to print' )
    .option( "-i, --images", "Wait for images to load" )
    .version( '0.0.1', '-v, --version', 'Output the current version' )
    .helpOption( '-?, --help', 'Display information' )
    .showHelpAfterError()
    .parse( process.argv );

( async () => {
    let options: opts = {
        headless: true,
        devtools: false,
        defaultViewport: {
            width: 3960,
            height: 2160,
            devicePixelRatio: 1
        },
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: [ "--disable-extensions", "--enable-automation" ],
        // executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",

        "args": [
            "--no-sandbox",
            "--start-maximized",
            "--window-size=3960,2160",
            '--use-gl=swiftshader',
            '--aggressive-cache-discard',
            '--disable-cache',
            '--disable-application-cache',
            '--disable-offline-load-stale-cache',
            '--disable-gpu-shader-disk-cache',
            '--media-cache-size=0',
            '--disk-cache-size=0',

            // `--disable-extensions-except=${nocookies}`,
            `--load-extension=${nocookies},${noads}`,
            // `--load-extension=${noads}`,
            '--enable-automation',

            // Windows NUL: equivalent to /dev/null
            // '--disk-cache-dir=NUL:',
            // '--media-cache-dir=NUL:',

            // https://stackoverflow.com/questions/60786130/puppeteer-chrome-cache-dir-with-dev-null-is-creating-a-folder-dev-null-instead
        ]
    }

    const opts = program.opts();

    // no need to type ".pdf" extension of filename param
    if ( !program.args[ 0 ].endsWith( ".pdf" ) ) program.args[ 0 ] += ".pdf"

    // no need to type https(s):// of url param
    if ( !program.args[ 1 ].startsWith( "htt" ) ) program.args[ 1 ] = "https://" + program.args[ 1 ]

    if ( os.platform() === "win32" ) {
        // options.executablePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
        options.executablePath = chrome
        options.args.push( '--disk-cache-dir=NUL:', '--media-cache-dir=NUL:' );
    }

    console.log( msg( figlet.textSync( "PDFSHOT" ), 2 ) );
    console.log( "" )
    console.log( msg( "Generating " + program.args[ 0 ] + " from " + program.args[ 1 ], 1 ) )
    console.log( "" )
    console.log( "" )

    // Website URL to export as pdf
    const website_url = program.args[ 1 ];

    // Create a browser instance
    const browser = await puppeteer.launch( options );

    // Create a new page
    const page = await browser.newPage();

    // await page.setViewport( { width: 1920, height: 1080 } )
    await page.setUserAgent( 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.56' );

    // Open URL in current page
    await page.goto( website_url, { waitUntil: 'networkidle0' } );

    // To reflect CSS used for screens instead of print
    await page.emulateMediaType( 'screen' );

    const newInnerHTML: string = `<div style="display: block; font-size: 16px; background-color: white; color: blue"><p><br>${website_url}<br><br></p></div>`

    await page.evaluate( ( newInnerHTML: string ) => {
        const dom = document.body
        dom.innerHTML = newInnerHTML + dom.innerHTML
    }, newInnerHTML );

    if ( opts.images ) {
        await page.evaluate( scrollToBottom );
    }

    await page.pdf( {
        path: program.args[ 0 ],
        format: 'A3',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        // margin: "none",
        // margin: {
        //     top: '2.54cm',
        //     bottom: '2.54cm',
        //     left: '2.54cm',
        //     right: '2.54cm'
        // }


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
