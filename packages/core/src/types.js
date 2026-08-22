/**
 * @file Type definitions for @unweave/core
 * This file provides JSDoc typedefs for TypeScript declaration generation.
 */

/**
 * @typedef {Object} ViewportOptions
 * @property {number} width - Viewport width in pixels
 * @property {number} height - Viewport height in pixels
 */

/**
 * @typedef {Object} ExtractOptions
 * @property {boolean} [screenshot] - Take screenshot
 * @property {string[]} [screenshotTypes] - Screenshot types: 'viewport', 'full', 'fullPage', 'mobile'
 * @property {string|ViewportOptions} [viewport] - Viewport mode or dimensions
 * @property {number} [waitFor] - Wait time in ms for selector
 * @property {string} [userAgent] - Custom user agent string
 * @property {Object} [screenshots] - Screenshot configuration object
 */

/**
 * @typedef {Object} ExtractedElement
 * @property {string} tagName - Lowercase tag name
 * @property {string|null} id - Element ID
 * @property {string|null} className - Element class name
 * @property {Object<string,string>} attributes - All attributes
 * @property {Object<string,string>} computedStyles - Computed CSS styles
 * @property {Object|null} boundingRect - Bounding rectangle {x, y, width, height}
 * @property {string|null} textContent - Trimmed text content (max 200 chars)
 */

/**
 * @typedef {Object} ExtractedImage
 * @property {string} src - Image source URL
 * @property {string} alt - Alt text
 * @property {number} width - Natural width
 * @property {number} height - Natural height
 */

/**
 * @typedef {Object} ExtractedMeta
 * @property {string} [viewport] - Viewport meta tag content
 * @property {string} [charset] - Document charset
 * @property {string} [description] - Meta description
 */

/**
 * @typedef {Object} ExtractedData
 * @property {string} url - Final page URL
 * @property {string} title - Page title
 * @property {Object<string,string>} cssVariables - CSS custom properties
 * @property {ExtractedElement[]} elements - All extracted elements
 * @property {ExtractedImage[]} images - Page images
 * @property {ExtractedMeta} meta - Page meta tags
 * @property {Object<string,string>} [screenshots] - Base64 encoded screenshots
 * @property {string} [error] - Error message if extraction failed
 */

/**
 * @typedef {Object} ColorAnalysis
 * @property {string[]} all - All unique colors
 * @property {string[]} backgrounds - Background colors
 * @property {string[]} text - Text colors
 * @property {string[]} borders - Border colors
 * @property {Object<string,string>} cssVariables - CSS variables that are colors
 */

/**
 * @typedef {Object} SpacingAnalysis
 * @property {number[]} all - All unique spacing values (px)
 * @property {number[]} padding - Padding values
 * @property {number[]} margin - Margin values
 * @property {number[]} gap - Gap values
 */

/**
 * @typedef {Object} RadiusAnalysis
 * @property {number[]} all - All unique border radius values (px)
 */

/**
 * @typedef {Object} TypographyAnalysis
 * @property {string[]} fonts - Unique font families
 * @property {number[]} fontSizes - Unique font sizes (px)
 * @property {(string|number)[]} fontWeights - Unique font weights
 * @property {string[]} lineHeights - Unique line heights
 */

/**
 * @typedef {Object} ComponentAnalysis
 * @property {string} type - Component type
 * @property {string} name - Component name
 * @property {string} selector - CSS selector
 * @property {Object} props - Inferred props
 * @property {string[]} states - Component states
 * @property {string[]} variants - Component variants
 */

/**
 * @typedef {Object} DesignSystemAnalysis
 * @property {ColorAnalysis} colors - Color palette
 * @property {SpacingAnalysis} spacing - Spacing scale
 * @property {RadiusAnalysis} radius - Border radius
 * @property {TypographyAnalysis} typography - Typography scale
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {DesignSystemAnalysis} designSystem - Design system tokens
 * @property {ComponentAnalysis[]} components - Classified components
 * @property {Object} patterns - Detected UI patterns
 * @property {Object} stats - Statistics
 * @property {number} stats.totalElements - Total elements analyzed
 * @property {number} stats.uniqueColors - Unique color count
 * @property {number} stats.uniqueSpacing - Unique spacing count
 * @property {number} stats.uniqueRadius - Unique radius count
 * @property {number} stats.uniqueFonts - Unique font count
 * @property {string} [error] - Error message if analysis failed
 */

/**
 * @typedef {Object} PipelineOptions
 * @property {boolean} [screenshot] - Take screenshot
 * @property {string[]} [screenshotTypes] - Screenshot types
 * @property {string|ViewportOptions} [viewport] - Viewport
 * @property {number} [waitFor] - Wait time
 * @property {string} [component] - Component name for spec generation
 * @property {string} [componentType] - Component type (button, input, card, modal, navigation, generic)
 * @property {string} [format] - Output format: 'react', 'vue', 'html'
 * @property {boolean} [typescript] - Generate TypeScript
 * @property {string} [learn] - Save as reference name
 * @property {Function} [onProgress] - Progress callback (progress: number, message: string) => void
 */

/**
 * @typedef {Object} PipelineResult
 * @property {string} url - Source URL
 * @property {boolean} success - Whether pipeline succeeded
 * @property {ExtractedData} [extracted] - Extracted data (if success)
 * @property {AnalysisResult} [analysis] - Analysis results (if success)
 * @property {Object} [spec] - Component specification (if success)
 * @property {Object} [generated] - Generated code (if success)
 * @property {string} [reference] - Reference path (if saved)
 * @property {string} [error] - Error message (if failed)
 * @property {string} [stack] - Error stack trace (if failed)
 */

/**
 * @typedef {Object} SpecOptions
 * @property {string} componentName - Component name
 * @property {string} componentType - Component type
 * @property {string} [description] - Component description
 * @property {string} [source] - Source URL
 */

/**
 * @typedef {Object} GenerateOptions
 * @property {'react'|'vue'|'html'} format - Output format
 * @property {boolean} [typescript] - Use TypeScript
 */

/**
 * @typedef {Object} ReferenceData
 * @property {string} url - Source URL
 * @property {ExtractedData} extracted - Extracted data
 * @property {AnalysisResult} analysis - Analysis results
 * @property {Object} [spec] - Component specification
 * @property {Object} [generated] - Generated code
 * @property {string} timestamp - ISO timestamp
 */

/**
 * @typedef {Object} DiffResult
 * @property {string[]} onlyInFirst - Items only in first
 * @property {string[]} onlyInSecond - Items only in second
 * @property {string[]} common - Items in both
 */

/**
 * @typedef {Object} DesignSystemDiff
 * @property {DiffResult} colors - Color differences
 * @property {DiffResult} spacing - Spacing differences
 * @property {DiffResult} radius - Radius differences
 * @property {Object} typography - Typography differences
 * @property {DiffResult} typography.fonts - Font differences
 * @property {DiffResult} typography.sizes - Font size differences
 */

/**
 * @typedef {Object} CompareResult
 * @property {string} url1 - First URL
 * @property {string} url2 - Second URL
 * @property {DesignSystemDiff} designSystemDiff - Design system differences
 * @property {DiffResult} componentDiff - Component type differences
 * @property {Object} patternDiff - Pattern differences
 */
export {};
