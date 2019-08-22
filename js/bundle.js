(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let alphabetGrid = [];

class Alphabet
{
    static build()
    {
        let searchSpace = '';
        for(let i = 0; i < 10; i++)
        {
            searchSpace += ''+i;
        }

        for(let i = 0; i < 26; i++)
        {
            // add the letters a through z in upper and lower case by their character code
            searchSpace += String.fromCharCode(i + 65);
            searchSpace += String.fromCharCode(i + 97);
        }
        alphabetGrid = searchSpace.split('');
        this.shuffle();
    }

    static shuffle()
    {
        this.randomizedAlphabet = [...alphabetGrid].shuffle();
    }

    static getRandomLetter()
    {
        if(!(this.randomizedAlphabet && this.randomizedAlphabet.length))
        {
            this.shuffle();
        }

        return this.randomizedAlphabet.pop();
    }
};

Alphabet.build();

module.exports = Alphabet;

},{}],2:[function(require,module,exports){
    const Task = require('./Tasks/Task');

    class CPUFullError extends Error{};
    class CPUDuplicateTaskError extends Error{};
    class InvalidTaskError extends Error{};

    class CPU
    {
        constructor(name, speed)
        {
            /**
             * @type {string}
             */
            this.name = name?name:"Processor";
            /**
             * @type {number}
             */
            this.speed = speed?speed:150;
            /**
             * @type {Array.<TASK>}
             */
            this.tasks = [];
        }

        getCyclesForTask(task)
        {
            // the amount of cycles the cpu is going to devote to each task is 1/nth of the total cycles
            // where n is the total of tasks that will be run including this task
            // I'm going to fudge with that a bit to make sure no rogue amounts start appearing and dissappearing

            return Math.max(task.minimumRequiredCycles, Math.floor(this.speed / (this.tasks.length + 1)));
        }

        addTask(task)
        {
            if (!(task instanceof Task))
            {
                throw new InvalidTaskError('Tried to add a non task object to a processor');
            }
            if(this.tasks.indexOf(task)>=0)
            {
                throw new CPUDuplicateTaskError('This task is already on the CPU');
            }

            let cyclesToAssign = this.getCyclesForTask(task),
                idealCyclesToAssign = cyclesToAssign;
            if(cyclesToAssign > this.freeableCycles)
            {
                throw new CPUFullError('Tried to add more cycles to the CPU than there are free cycles for');
            }

            if(this.tasks.length > 0)
            {
                let cyclesToTryToTakeAwayFromEachProcess = Math.ceil(idealCyclesToAssign / this.tasks.length),
                    cyclesFreedUp = 0;

                for(let task of this.tasks)
                {
                    cyclesFreedUp += task.freeCycles(cyclesToTryToTakeAwayFromEachProcess);
                }
                cyclesToAssign = cyclesFreedUp;
            }
            task.setCyclesPerTick(cyclesToAssign);

            this.tasks.push(task);
            $(task).on('complete', ()=>{
                this.completeTask(task);
            });
            return this;
        }

        completeTask(task)
        {
            let freedCycles = task.cyclesPerTick;
            this.tasks.removeElement(task);

            if(this.tasks.length >= 1)
            {
                let freedCyclesPerTick = Math.floor(freedCycles/this.tasks.length);
                let i = 0;
                while(i < this.tasks.length && freedCycles > 0)
                {
                    let task = this.tasks[i];
                    freedCycles -= freedCyclesPerTick;
                    task.addCycles(freedCyclesPerTick);
                    i++;
                }
            }
            $(this).trigger('taskComplete', [task]);
        }

        tick()
        {
            for(let task of this.tasks)
            {
                task.tick();
            }
        }

        get load()
        {
            let minimum = 0;
            for(let task of this.tasks)
            {
                minimum += task.minimumRequiredCycles;
            }
            return this.speed - minimum;
        }
    }

module.exports = CPU;

},{"./Tasks/Task":19}],3:[function(require,module,exports){
const EventListener = require('../EventListener');

class Challenge extends EventListener
{
    /**
     * An abstract class to represent all challenges a MissionComputer might have
     * I could namescape this in Missions, and may do this later but currently exists in the namespace
     * Downlink.Challenges.Challenge
     *
     * @param {string} name         The name of the challenge, useful for UI purposes
     * @param {number} difficulty   An int to describe in some abstract manner what reward ratio this challenge
     *     should provide. Provided in the form of an integer.
     */
    constructor(name, difficulty)
    {
        super();
        this.name = name;
        this.difficulty = difficulty;
        this.solved = false;
    }

    solve()
    {
        this.solved = true;
        this.signalSolved();
    }

    /**
     * A method to signal to the Mission Computer, or localhost that a Challenge has been complete.
     */
    signalSolved()
    {
        this.solved = true;
        this.trigger('solved');
        return this;
    }
}

module.exports = Challenge;

},{"../EventListener":10}],4:[function(require,module,exports){
/**
 * @type {{}}
 */
const DIFFICULTIES = {
    'EASY':{name:'Linear', size:{min:7, max:11}},
    'MEDIUM':{name:'Quadratic', size:{min:10,max:15}},
    'HARD':{name:'Cubic', size:{min:15,max:20}}
};

function getRandomIntBetween(min, max)
{
    return Math.floor(Math.random() * (+max - +min)) + +min
}
const Challenge = require('./Challenge');
class Encryption extends Challenge
{
    constructor(difficulty)
    {
        let rows = getRandomIntBetween(difficulty.size.min, difficulty.size.max),
            cols = getRandomIntBetween(difficulty.size.min, difficulty.size.max),
            difficultyRatio = Math.floor(Math.sqrt(rows * cols));
        super(difficulty.name + ' Encryption', difficultyRatio);
        this.rows = rows;
        this.cols = cols;
    }

    static get DIFFICULTIES()
    {
        return DIFFICULTIES;
    }

    static getNewLinearEncryption()
    {
        return new Encryption(DIFFICULTIES.EASY);
    }

    static getNewQuadraticEncryption()
    {
        return new Encryption(DIFFICULTIES.MEDIUM);
    }

}

module.exports = Encryption;

},{"./Challenge":3}],5:[function(require,module,exports){
const dictionary = require('./dictionary');
const PASSWORD_TYPES = {
    'DICTIONARY':'Dictionary',
    'ALPHANUMERIC':'Alphanumeric'
};
const Challenge = require('./Challenge');


class Password extends Challenge
{
    constructor(text, type, solved, difficulty)
    {
        super(type + ' Password', difficulty);
        this.text = text;
        this.type = type;
    }

    attack(testPassword)
    {
        $(this).trigger('start');
        if (this.text === testPassword)
        {
            return true;
        }
        return false;
    }

    static randomDictionaryPassword()
    {
        return new Password(dictionary.randomElement(), PASSWORD_TYPES.DICTIONARY, false, 1);
    }

    static randomAlphanumericPassword()
    {
        let stringLength = Math.floor(Math.random() * 5) + 5;
        let password = '';
        for (let i = 0; i < stringLength; i++)
        {
            password += Downlink.Alphabet.getRandomLetter();
        }
        return new Password(password, PASSWORD_TYPES.ALPHANUMERIC, false, stringLength);
    }


    static get dictionary()
    {
        return dictionary;
    }

    static get PASSWORD_TYPES()
    {
        return PASSWORD_TYPES;
    }
}

module.exports = Password;

},{"./Challenge":3,"./dictionary":6}],6:[function(require,module,exports){
// stolen from Bart Busschot's xkpasswd JS github repo
// See https://github.com/bbusschots/hsxkpasswd.js

let dictionary = [
    'abandoned',
    'abilities',
    'aboriginal',
    'absolutely',
    'absorption',
    'abstracts',
    'academics',
    'acceptable',
    'acceptance',
    'accepting',
    'accessibility',
    'accessible',
    'accessing',
    'accessories',
    'accessory',
    'accidents',
    'accommodate',
    'accommodation',
    'accommodations',
    'accompanied',
    'accompanying',
    'accomplish',
    'accomplished',
    'accordance',
    'according',
    'accordingly',
    'accountability',
    'accounting',
    'accreditation',
    'accredited',
    'accurately',
    'acdbentity',
    'achievement',
    'achievements',
    'achieving',
    'acknowledge',
    'acknowledged',
    'acquisition',
    'acquisitions',
    'activated',
    'activation',
    'activists',
    'activities',
    'adaptation',
    'addiction',
    'additional',
    'additionally',
    'additions',
    'addressed',
    'addresses',
    'addressing',
    'adjective',
    'adjustable',
    'adjustment',
    'adjustments',
    'administered',
    'administration',
    'administrative',
    'administrator',
    'administrators',
    'admission',
    'admissions',
    'adolescent',
    'advancement',
    'advantage',
    'advantages',
    'adventure',
    'adventures',
    'advertise',
    'advertisement',
    'advertisements',
    'advertiser',
    'advertisers',
    'advertising',
    'aerospace',
    'affecting',
    'affiliate',
    'affiliated',
    'affiliates',
    'affiliation',
    'affordable',
    'afghanistan',
    'afternoon',
    'afterwards',
    'aggregate',
    'aggressive',
    'agreement',
    'agreements',
    'agricultural',
    'agriculture',
    'albuquerque',
    'alexander',
    'alexandria',
    'algorithm',
    'algorithms',
    'alignment',
    'allocated',
    'allocation',
    'allowance',
    'alphabetical',
    'alternate',
    'alternative',
    'alternatively',
    'alternatives',
    'aluminium',
    'ambassador',
    'amendment',
    'amendments',
    'amenities',
    'americans',
    'amplifier',
    'amsterdam',
    'analytical',
    'animation',
    'anniversary',
    'annotated',
    'annotation',
    'announced',
    'announcement',
    'announcements',
    'announces',
    'anonymous',
    'answering',
    'antarctica',
    'anthropology',
    'antibodies',
    'anticipated',
    'antivirus',
    'apartment',
    'apartments',
    'apparatus',
    'apparently',
    'appearance',
    'appearing',
    'appliance',
    'appliances',
    'applicable',
    'applicant',
    'applicants',
    'application',
    'applications',
    'appointed',
    'appointment',
    'appointments',
    'appraisal',
    'appreciate',
    'appreciated',
    'appreciation',
    'approaches',
    'appropriate',
    'appropriations',
    'approximate',
    'approximately',
    'arbitrary',
    'arbitration',
    'architect',
    'architects',
    'architectural',
    'architecture',
    'argentina',
    'arguments',
    'arlington',
    'armstrong',
    'arrangement',
    'arrangements',
    'arthritis',
    'artificial',
    'assembled',
    'assessing',
    'assessment',
    'assessments',
    'assignment',
    'assignments',
    'assistance',
    'assistant',
    'associate',
    'associated',
    'associates',
    'association',
    'associations',
    'assumption',
    'assumptions',
    'assurance',
    'astrology',
    'astronomy',
    'athletics',
    'atmosphere',
    'atmospheric',
    'attachment',
    'attachments',
    'attempted',
    'attempting',
    'attendance',
    'attending',
    'attention',
    'attitudes',
    'attorneys',
    'attraction',
    'attractions',
    'attractive',
    'attribute',
    'attributes',
    'australia',
    'australian',
    'authentic',
    'authentication',
    'authorities',
    'authority',
    'authorization',
    'authorized',
    'automated',
    'automatic',
    'automatically',
    'automation',
    'automobile',
    'automobiles',
    'automotive',
    'availability',
    'available',
    'awareness',
    'azerbaijan',
    'background',
    'backgrounds',
    'bacterial',
    'baltimore',
    'bandwidth',
    'bangladesh',
    'bankruptcy',
    'barcelona',
    'basically',
    'basketball',
    'bathrooms',
    'batteries',
    'battlefield',
    'beastality',
    'beautiful',
    'beautifully',
    'beginners',
    'beginning',
    'behavioral',
    'behaviour',
    'benchmark',
    'beneficial',
    'bestsellers',
    'beverages',
    'bibliographic',
    'bibliography',
    'biodiversity',
    'biographies',
    'biography',
    'biological',
    'biotechnology',
    'birmingham',
    'blackberry',
    'blackjack',
    'bloomberg',
    'bluetooth',
    'bookmarks',
    'bookstore',
    'boulevard',
    'boundaries',
    'bracelets',
    'brazilian',
    'breakdown',
    'breakfast',
    'breathing',
    'brilliant',
    'britannica',
    'broadband',
    'broadcast',
    'broadcasting',
    'brochures',
    'brunswick',
    'buildings',
    'bulgarian',
    'burlington',
    'businesses',
    'butterfly',
    'calculate',
    'calculated',
    'calculation',
    'calculations',
    'calculator',
    'calculators',
    'calendars',
    'calibration',
    'california',
    'cambridge',
    'camcorder',
    'camcorders',
    'campaigns',
    'cancellation',
    'cancelled',
    'candidate',
    'candidates',
    'capabilities',
    'capability',
    'cardiovascular',
    'carefully',
    'caribbean',
    'cartridge',
    'cartridges',
    'catalogue',
    'categories',
    'cathedral',
    'catherine',
    'celebrate',
    'celebration',
    'celebrities',
    'celebrity',
    'centuries',
    'certainly',
    'certificate',
    'certificates',
    'certification',
    'certified',
    'challenge',
    'challenged',
    'challenges',
    'challenging',
    'champagne',
    'champions',
    'championship',
    'championships',
    'chancellor',
    'changelog',
    'character',
    'characteristic',
    'characteristics',
    'characterization',
    'characterized',
    'characters',
    'charitable',
    'charleston',
    'charlotte',
    'checklist',
    'chemicals',
    'chemistry',
    'chevrolet',
    'childhood',
    'childrens',
    'chocolate',
    'cholesterol',
    'christian',
    'christianity',
    'christians',
    'christina',
    'christine',
    'christmas',
    'christopher',
    'chronicle',
    'chronicles',
    'cigarette',
    'cigarettes',
    'cincinnati',
    'circulation',
    'circumstances',
    'citations',
    'citizenship',
    'citysearch',
    'civilization',
    'classical',
    'classification',
    'classified',
    'classifieds',
    'classroom',
    'clearance',
    'cleveland',
    'coalition',
    'cognitive',
    'collaboration',
    'collaborative',
    'colleague',
    'colleagues',
    'collectables',
    'collected',
    'collectible',
    'collectibles',
    'collecting',
    'collection',
    'collections',
    'collective',
    'collector',
    'collectors',
    'columnists',
    'combination',
    'combinations',
    'combining',
    'comfortable',
    'commander',
    'commentary',
    'commented',
    'commercial',
    'commission',
    'commissioner',
    'commissioners',
    'commissions',
    'commitment',
    'commitments',
    'committed',
    'committee',
    'committees',
    'commodities',
    'commodity',
    'commonwealth',
    'communicate',
    'communication',
    'communications',
    'communist',
    'communities',
    'community',
    'companies',
    'companion',
    'comparable',
    'comparative',
    'comparing',
    'comparison',
    'comparisons',
    'compatibility',
    'compatible',
    'compensation',
    'competent',
    'competing',
    'competition',
    'competitions',
    'competitive',
    'competitors',
    'compilation',
    'complaint',
    'complaints',
    'complement',
    'completed',
    'completely',
    'completing',
    'completion',
    'complexity',
    'compliance',
    'compliant',
    'complicated',
    'complications',
    'complimentary',
    'component',
    'components',
    'composite',
    'composition',
    'compounds',
    'comprehensive',
    'compressed',
    'compression',
    'compromise',
    'computation',
    'computational',
    'computers',
    'computing',
    'concentrate',
    'concentration',
    'concentrations',
    'conceptual',
    'concerned',
    'concerning',
    'concluded',
    'conclusion',
    'conclusions',
    'condition',
    'conditional',
    'conditioning',
    'conditions',
    'conducted',
    'conducting',
    'conference',
    'conferences',
    'conferencing',
    'confidence',
    'confident',
    'confidential',
    'confidentiality',
    'configuration',
    'configurations',
    'configure',
    'configured',
    'configuring',
    'confirmation',
    'confirmed',
    'conflicts',
    'confusion',
    'congratulations',
    'congressional',
    'conjunction',
    'connected',
    'connecticut',
    'connecting',
    'connection',
    'connections',
    'connectivity',
    'connector',
    'connectors',
    'conscious',
    'consciousness',
    'consecutive',
    'consensus',
    'consequence',
    'consequences',
    'consequently',
    'conservation',
    'conservative',
    'considerable',
    'consideration',
    'considerations',
    'considered',
    'considering',
    'considers',
    'consistency',
    'consistent',
    'consistently',
    'consisting',
    'consolidated',
    'consolidation',
    'consonant',
    'consortium',
    'conspiracy',
    'constantly',
    'constitute',
    'constitutes',
    'constitution',
    'constitutional',
    'constraint',
    'constraints',
    'construct',
    'constructed',
    'construction',
    'consultancy',
    'consultant',
    'consultants',
    'consultation',
    'consulting',
    'consumers',
    'consumption',
    'contacted',
    'contacting',
    'contained',
    'container',
    'containers',
    'containing',
    'contamination',
    'contemporary',
    'continent',
    'continental',
    'continually',
    'continued',
    'continues',
    'continuing',
    'continuity',
    'continuous',
    'continuously',
    'contracting',
    'contractor',
    'contractors',
    'contracts',
    'contribute',
    'contributed',
    'contributing',
    'contribution',
    'contributions',
    'contributor',
    'contributors',
    'controlled',
    'controller',
    'controllers',
    'controlling',
    'controversial',
    'controversy',
    'convenience',
    'convenient',
    'convention',
    'conventional',
    'conventions',
    'convergence',
    'conversation',
    'conversations',
    'conversion',
    'converted',
    'converter',
    'convertible',
    'convicted',
    'conviction',
    'convinced',
    'cooperation',
    'cooperative',
    'coordinate',
    'coordinated',
    'coordinates',
    'coordination',
    'coordinator',
    'copenhagen',
    'copyright',
    'copyrighted',
    'copyrights',
    'corporate',
    'corporation',
    'corporations',
    'corrected',
    'correction',
    'corrections',
    'correctly',
    'correlation',
    'correspondence',
    'corresponding',
    'corruption',
    'cosmetics',
    'counseling',
    'countries',
    'creations',
    'creativity',
    'creatures',
    'criterion',
    'criticism',
    'crossword',
    'cumulative',
    'currencies',
    'currently',
    'curriculum',
    'customers',
    'customise',
    'customize',
    'customized',
    'dangerous',
    'databases',
    'daughters',
    'decisions',
    'declaration',
    'decorating',
    'decorative',
    'decreased',
    'dedicated',
    'defendant',
    'defensive',
    'definitely',
    'definition',
    'definitions',
    'delegation',
    'delicious',
    'delivered',
    'delivering',
    'demanding',
    'democracy',
    'democratic',
    'democrats',
    'demographic',
    'demonstrate',
    'demonstrated',
    'demonstrates',
    'demonstration',
    'department',
    'departmental',
    'departments',
    'departure',
    'dependence',
    'dependent',
    'depending',
    'deployment',
    'depression',
    'descending',
    'described',
    'describes',
    'describing',
    'description',
    'descriptions',
    'designated',
    'designation',
    'designers',
    'designing',
    'desirable',
    'desperate',
    'destination',
    'destinations',
    'destroyed',
    'destruction',
    'detection',
    'detective',
    'determination',
    'determine',
    'determined',
    'determines',
    'determining',
    'deutschland',
    'developed',
    'developer',
    'developers',
    'developing',
    'development',
    'developmental',
    'developments',
    'deviation',
    'diagnosis',
    'diagnostic',
    'dictionaries',
    'dictionary',
    'difference',
    'differences',
    'different',
    'differential',
    'differently',
    'difficult',
    'difficulties',
    'difficulty',
    'dimension',
    'dimensional',
    'dimensions',
    'direction',
    'directions',
    'directive',
    'directories',
    'directors',
    'directory',
    'disabilities',
    'disability',
    'disappointed',
    'discharge',
    'disciplinary',
    'discipline',
    'disciplines',
    'disclaimer',
    'disclaimers',
    'disclosure',
    'discounted',
    'discounts',
    'discovered',
    'discovery',
    'discretion',
    'discrimination',
    'discussed',
    'discusses',
    'discussing',
    'discussion',
    'discussions',
    'disorders',
    'dispatched',
    'displayed',
    'displaying',
    'disposition',
    'distances',
    'distinction',
    'distinguished',
    'distribute',
    'distributed',
    'distribution',
    'distributions',
    'distributor',
    'distributors',
    'districts',
    'disturbed',
    'diversity',
    'divisions',
    'documentary',
    'documentation',
    'documented',
    'documents',
    'dominican',
    'donations',
    'downloadable',
    'downloaded',
    'downloading',
    'downloads',
    'dramatically',
    'duplicate',
    'earthquake',
    'ecological',
    'ecommerce',
    'economics',
    'economies',
    'edinburgh',
    'editorial',
    'editorials',
    'education',
    'educational',
    'educators',
    'effective',
    'effectively',
    'effectiveness',
    'efficiency',
    'efficient',
    'efficiently',
    'elections',
    'electoral',
    'electrical',
    'electricity',
    'electronic',
    'electronics',
    'elementary',
    'elevation',
    'eligibility',
    'eliminate',
    'elimination',
    'elizabeth',
    'elsewhere',
    'emergency',
    'emissions',
    'emotional',
    'empirical',
    'employees',
    'employers',
    'employment',
    'enclosure',
    'encounter',
    'encountered',
    'encourage',
    'encouraged',
    'encourages',
    'encouraging',
    'encryption',
    'encyclopedia',
    'endangered',
    'endorsement',
    'enforcement',
    'engagement',
    'engineering',
    'engineers',
    'enhancement',
    'enhancements',
    'enhancing',
    'enlargement',
    'enquiries',
    'enrollment',
    'enterprise',
    'enterprises',
    'entertaining',
    'entertainment',
    'entrepreneur',
    'entrepreneurs',
    'environment',
    'environmental',
    'environments',
    'equations',
    'equilibrium',
    'equipment',
    'equivalent',
    'especially',
    'essential',
    'essentially',
    'essentials',
    'establish',
    'established',
    'establishing',
    'establishment',
    'estimated',
    'estimates',
    'estimation',
    'evaluated',
    'evaluating',
    'evaluation',
    'evaluations',
    'evanescence',
    'eventually',
    'everybody',
    'everything',
    'everywhere',
    'evolution',
    'examination',
    'examinations',
    'examining',
    'excellence',
    'excellent',
    'exception',
    'exceptional',
    'exceptions',
    'excessive',
    'exchanges',
    'excitement',
    'excluding',
    'exclusion',
    'exclusive',
    'exclusively',
    'execution',
    'executive',
    'executives',
    'exemption',
    'exercises',
    'exhibition',
    'exhibitions',
    'existence',
    'expanding',
    'expansion',
    'expectations',
    'expenditure',
    'expenditures',
    'expensive',
    'experience',
    'experienced',
    'experiences',
    'experiencing',
    'experiment',
    'experimental',
    'experiments',
    'expertise',
    'expiration',
    'explained',
    'explaining',
    'explanation',
    'explicitly',
    'exploration',
    'exploring',
    'explosion',
    'expressed',
    'expression',
    'expressions',
    'extending',
    'extension',
    'extensions',
    'extensive',
    'extraction',
    'extraordinary',
    'extremely',
    'facilitate',
    'facilities',
    'factories',
    'fairfield',
    'fantastic',
    'fascinating',
    'favorites',
    'favourite',
    'favourites',
    'featuring',
    'federation',
    'fellowship',
    'festivals',
    'filtering',
    'financial',
    'financing',
    'findarticles',
    'finishing',
    'fireplace',
    'fisheries',
    'flexibility',
    'following',
    'forbidden',
    'forecasts',
    'forgotten',
    'formation',
    'formatting',
    'forwarding',
    'foundation',
    'foundations',
    'fragrance',
    'fragrances',
    'framework',
    'franchise',
    'francisco',
    'frankfurt',
    'frederick',
    'freelance',
    'frequencies',
    'frequency',
    'frequently',
    'friendship',
    'frontpage',
    'functional',
    'functionality',
    'functioning',
    'functions',
    'fundamental',
    'fundamentals',
    'fundraising',
    'furnished',
    'furnishings',
    'furniture',
    'furthermore',
    'galleries',
    'gardening',
    'gathering',
    'genealogy',
    'generally',
    'generated',
    'generates',
    'generating',
    'generation',
    'generations',
    'generator',
    'generators',
    'gentleman',
    'geographic',
    'geographical',
    'geography',
    'geological',
    'gibraltar',
    'girlfriend',
    'governance',
    'governing',
    'government',
    'governmental',
    'governments',
    'gradually',
    'graduated',
    'graduates',
    'graduation',
    'graphical',
    'greenhouse',
    'greensboro',
    'greetings',
    'groundwater',
    'guarantee',
    'guaranteed',
    'guarantees',
    'guatemala',
    'guestbook',
    'guidelines',
    'halloween',
    'hampshire',
    'handhelds',
    'happening',
    'happiness',
    'harassment',
    'hardcover',
    'hazardous',
    'headlines',
    'headphones',
    'headquarters',
    'healthcare',
    'helicopter',
    'henderson',
    'hepatitis',
    'hierarchy',
    'highlight',
    'highlighted',
    'highlights',
    'historical',
    'hollywood',
    'holocaust',
    'hopefully',
    'horizontal',
    'hospitality',
    'hospitals',
    'household',
    'households',
    'housewares',
    'housewives',
    'humanitarian',
    'humanities',
    'hungarian',
    'huntington',
    'hurricane',
    'hydraulic',
    'hydrocodone',
    'hypothesis',
    'hypothetical',
    'identical',
    'identification',
    'identified',
    'identifier',
    'identifies',
    'identifying',
    'illustrated',
    'illustration',
    'illustrations',
    'imagination',
    'immediate',
    'immediately',
    'immigrants',
    'immigration',
    'immunology',
    'implement',
    'implementation',
    'implemented',
    'implementing',
    'implications',
    'importance',
    'important',
    'importantly',
    'impossible',
    'impressed',
    'impression',
    'impressive',
    'improvement',
    'improvements',
    'improving',
    'inappropriate',
    'incentive',
    'incentives',
    'incidence',
    'incidents',
    'including',
    'inclusion',
    'inclusive',
    'incomplete',
    'incorporate',
    'incorporated',
    'incorrect',
    'increased',
    'increases',
    'increasing',
    'increasingly',
    'incredible',
    'independence',
    'independent',
    'independently',
    'indianapolis',
    'indicated',
    'indicates',
    'indicating',
    'indication',
    'indicator',
    'indicators',
    'indigenous',
    'individual',
    'individually',
    'individuals',
    'indonesia',
    'indonesian',
    'induction',
    'industrial',
    'industries',
    'inexpensive',
    'infection',
    'infections',
    'infectious',
    'inflation',
    'influence',
    'influenced',
    'influences',
    'information',
    'informational',
    'informative',
    'infrastructure',
    'infringement',
    'ingredients',
    'inherited',
    'initially',
    'initiated',
    'initiative',
    'initiatives',
    'injection',
    'innovation',
    'innovations',
    'innovative',
    'inquiries',
    'insertion',
    'inspection',
    'inspections',
    'inspector',
    'inspiration',
    'installation',
    'installations',
    'installed',
    'installing',
    'instances',
    'instantly',
    'institute',
    'institutes',
    'institution',
    'institutional',
    'institutions',
    'instruction',
    'instructional',
    'instructions',
    'instructor',
    'instructors',
    'instrument',
    'instrumental',
    'instrumentation',
    'instruments',
    'insulation',
    'insurance',
    'integrate',
    'integrated',
    'integrating',
    'integration',
    'integrity',
    'intellectual',
    'intelligence',
    'intelligent',
    'intensity',
    'intensive',
    'intention',
    'interaction',
    'interactions',
    'interactive',
    'interested',
    'interesting',
    'interests',
    'interface',
    'interfaces',
    'interference',
    'intermediate',
    'international',
    'internationally',
    'internship',
    'interpretation',
    'interpreted',
    'interracial',
    'intersection',
    'interstate',
    'intervals',
    'intervention',
    'interventions',
    'interview',
    'interviews',
    'introduce',
    'introduced',
    'introduces',
    'introducing',
    'introduction',
    'introductory',
    'invention',
    'inventory',
    'investigate',
    'investigated',
    'investigation',
    'investigations',
    'investigator',
    'investigators',
    'investing',
    'investment',
    'investments',
    'investors',
    'invisible',
    'invitation',
    'invitations',
    'involvement',
    'involving',
    'irrigation',
    'isolation',
    'jacksonville',
    'javascript',
    'jefferson',
    'jerusalem',
    'jewellery',
    'journalism',
    'journalist',
    'journalists',
    'jurisdiction',
    'kazakhstan',
    'keyboards',
    'kilometers',
    'knowledge',
    'knowledgestorm',
    'laboratories',
    'laboratory',
    'lafayette',
    'lancaster',
    'landscape',
    'landscapes',
    'languages',
    'lauderdale',
    'leadership',
    'legendary',
    'legislation',
    'legislative',
    'legislature',
    'legitimate',
    'lexington',
    'liabilities',
    'liability',
    'librarian',
    'libraries',
    'licensing',
    'liechtenstein',
    'lifestyle',
    'lightning',
    'lightweight',
    'likelihood',
    'limitation',
    'limitations',
    'limousines',
    'listening',
    'listprice',
    'literally',
    'literature',
    'lithuania',
    'litigation',
    'liverpool',
    'livestock',
    'locations',
    'logistics',
    'longitude',
    'looksmart',
    'louisiana',
    'louisville',
    'luxembourg',
    'macedonia',
    'machinery',
    'macintosh',
    'macromedia',
    'madagascar',
    'magazines',
    'magnificent',
    'magnitude',
    'mainstream',
    'maintained',
    'maintaining',
    'maintains',
    'maintenance',
    'malpractice',
    'management',
    'manchester',
    'mandatory',
    'manhattan',
    'manufacture',
    'manufactured',
    'manufacturer',
    'manufacturers',
    'manufacturing',
    'marijuana',
    'marketing',
    'marketplace',
    'massachusetts',
    'mastercard',
    'masturbating',
    'masturbation',
    'materials',
    'maternity',
    'mathematical',
    'mathematics',
    'mauritius',
    'meaningful',
    'meanwhile',
    'measurement',
    'measurements',
    'measuring',
    'mechanical',
    'mechanics',
    'mechanism',
    'mechanisms',
    'mediawiki',
    'medication',
    'medications',
    'medicines',
    'meditation',
    'mediterranean',
    'melbourne',
    'membership',
    'memorabilia',
    'mentioned',
    'merchandise',
    'merchants',
    'messaging',
    'messenger',
    'metabolism',
    'metallica',
    'methodology',
    'metropolitan',
    'microphone',
    'microsoft',
    'microwave',
    'migration',
    'milfhunter',
    'millennium',
    'milwaukee',
    'miniature',
    'ministers',
    'ministries',
    'minneapolis',
    'minnesota',
    'miscellaneous',
    'mississippi',
    'mitsubishi',
    'modelling',
    'moderator',
    'moderators',
    'modification',
    'modifications',
    'molecular',
    'molecules',
    'monitored',
    'monitoring',
    'montgomery',
    'mortality',
    'mortgages',
    'motherboard',
    'motivated',
    'motivation',
    'motorcycle',
    'motorcycles',
    'mountains',
    'movements',
    'mozambique',
    'multimedia',
    'municipal',
    'municipality',
    'musicians',
    'mysterious',
    'namespace',
    'narrative',
    'nashville',
    'nationally',
    'nationwide',
    'naturally',
    'navigation',
    'navigator',
    'necessarily',
    'necessary',
    'necessity',
    'negotiation',
    'negotiations',
    'neighborhood',
    'neighbors',
    'netherlands',
    'networking',
    'nevertheless',
    'newcastle',
    'newfoundland',
    'newsletter',
    'newsletters',
    'newspaper',
    'newspapers',
    'nicaragua',
    'nightlife',
    'nightmare',
    'nominated',
    'nomination',
    'nominations',
    'nonprofit',
    'northeast',
    'northwest',
    'norwegian',
    'notebooks',
    'notification',
    'notifications',
    'nottingham',
    'numerical',
    'nutrition',
    'nutritional',
    'obituaries',
    'objective',
    'objectives',
    'obligation',
    'obligations',
    'observation',
    'observations',
    'obtaining',
    'obviously',
    'occasional',
    'occasionally',
    'occasions',
    'occupation',
    'occupational',
    'occupations',
    'occurrence',
    'occurring',
    'offensive',
    'offerings',
    'officially',
    'officials',
    'omissions',
    'operating',
    'operation',
    'operational',
    'operations',
    'operators',
    'opponents',
    'opportunities',
    'opportunity',
    'opposition',
    'optimization',
    'orchestra',
    'ordinance',
    'organisation',
    'organisations',
    'organised',
    'organisms',
    'organization',
    'organizational',
    'organizations',
    'organized',
    'organizer',
    'organizing',
    'orientation',
    'originally',
    'otherwise',
    'ourselves',
    'outsourcing',
    'outstanding',
    'overnight',
    'ownership',
    'packaging',
    'paintball',
    'paintings',
    'palestine',
    'palestinian',
    'panasonic',
    'pantyhose',
    'paperback',
    'paperbacks',
    'paragraph',
    'paragraphs',
    'parameter',
    'parameters',
    'parenting',
    'parliament',
    'parliamentary',
    'partially',
    'participant',
    'participants',
    'participate',
    'participated',
    'participating',
    'participation',
    'particles',
    'particular',
    'particularly',
    'partition',
    'partnership',
    'partnerships',
    'passenger',
    'passengers',
    'passwords',
    'pathology',
    'pediatric',
    'penalties',
    'penetration',
    'peninsula',
    'pennsylvania',
    'perceived',
    'percentage',
    'perception',
    'perfectly',
    'performance',
    'performances',
    'performed',
    'performer',
    'performing',
    'periodically',
    'peripheral',
    'peripherals',
    'permalink',
    'permanent',
    'permission',
    'permissions',
    'permitted',
    'persistent',
    'personality',
    'personalized',
    'personally',
    'personals',
    'personnel',
    'perspective',
    'perspectives',
    'petersburg',
    'petroleum',
    'pharmaceutical',
    'pharmaceuticals',
    'pharmacies',
    'pharmacology',
    'phenomenon',
    'phentermine',
    'philadelphia',
    'philippines',
    'philosophy',
    'photograph',
    'photographer',
    'photographers',
    'photographic',
    'photographs',
    'photography',
    'photoshop',
    'physically',
    'physician',
    'physicians',
    'physiology',
    'pichunter',
    'pittsburgh',
    'placement',
    'plaintiff',
    'platforms',
    'playstation',
    'political',
    'politicians',
    'pollution',
    'polyester',
    'polyphonic',
    'popularity',
    'population',
    'populations',
    'porcelain',
    'portfolio',
    'portraits',
    'portsmouth',
    'portuguese',
    'positioning',
    'positions',
    'possession',
    'possibilities',
    'possibility',
    'postcards',
    'postposted',
    'potential',
    'potentially',
    'powerpoint',
    'powerseller',
    'practical',
    'practices',
    'practitioner',
    'practitioners',
    'preceding',
    'precipitation',
    'precisely',
    'precision',
    'predicted',
    'prediction',
    'predictions',
    'preference',
    'preferences',
    'preferred',
    'pregnancy',
    'preliminary',
    'preparation',
    'preparing',
    'prerequisite',
    'prescribed',
    'prescription',
    'presentation',
    'presentations',
    'presented',
    'presenting',
    'presently',
    'preservation',
    'president',
    'presidential',
    'presidents',
    'preventing',
    'prevention',
    'previously',
    'primarily',
    'princeton',
    'principal',
    'principle',
    'principles',
    'printable',
    'priorities',
    'prisoners',
    'privilege',
    'privileges',
    'probability',
    'procedure',
    'procedures',
    'proceeding',
    'proceedings',
    'processed',
    'processes',
    'processing',
    'processor',
    'processors',
    'procurement',
    'producers',
    'producing',
    'production',
    'productions',
    'productive',
    'productivity',
    'profession',
    'professional',
    'professionals',
    'professor',
    'programme',
    'programmer',
    'programmers',
    'programmes',
    'programming',
    'progressive',
    'prohibited',
    'projected',
    'projection',
    'projector',
    'projectors',
    'prominent',
    'promising',
    'promoting',
    'promotion',
    'promotional',
    'promotions',
    'properties',
    'proportion',
    'proposals',
    'proposition',
    'proprietary',
    'prospective',
    'prospects',
    'prostores',
    'protected',
    'protecting',
    'protection',
    'protective',
    'protocols',
    'prototype',
    'providence',
    'providers',
    'providing',
    'provinces',
    'provincial',
    'provision',
    'provisions',
    'psychiatry',
    'psychological',
    'psychology',
    'publication',
    'publications',
    'publicity',
    'published',
    'publisher',
    'publishers',
    'publishing',
    'punishment',
    'purchased',
    'purchases',
    'purchasing',
    'qualification',
    'qualifications',
    'qualified',
    'qualifying',
    'qualities',
    'quantitative',
    'quantities',
    'quarterly',
    'queensland',
    'questionnaire',
    'questions',
    'quotations',
    'radiation',
    'reactions',
    'realistic',
    'reasonable',
    'reasonably',
    'reasoning',
    'receivers',
    'receiving',
    'reception',
    'receptors',
    'recipient',
    'recipients',
    'recognised',
    'recognition',
    'recognize',
    'recognized',
    'recommend',
    'recommendation',
    'recommendations',
    'recommended',
    'recommends',
    'reconstruction',
    'recorders',
    'recording',
    'recordings',
    'recovered',
    'recreation',
    'recreational',
    'recruiting',
    'recruitment',
    'recycling',
    'reduction',
    'reductions',
    'reference',
    'referenced',
    'references',
    'referrals',
    'referring',
    'refinance',
    'reflected',
    'reflection',
    'reflections',
    'refrigerator',
    'refurbished',
    'regarding',
    'regardless',
    'registered',
    'registrar',
    'registration',
    'regression',
    'regularly',
    'regulated',
    'regulation',
    'regulations',
    'regulatory',
    'rehabilitation',
    'relations',
    'relationship',
    'relationships',
    'relatively',
    'relatives',
    'relaxation',
    'relevance',
    'reliability',
    'religions',
    'religious',
    'relocation',
    'remainder',
    'remaining',
    'remarkable',
    'remembered',
    'removable',
    'renaissance',
    'rendering',
    'renewable',
    'replacement',
    'replacing',
    'replication',
    'reporters',
    'reporting',
    'repository',
    'represent',
    'representation',
    'representations',
    'representative',
    'representatives',
    'represented',
    'representing',
    'represents',
    'reproduce',
    'reproduced',
    'reproduction',
    'reproductive',
    'republican',
    'republicans',
    'reputation',
    'requested',
    'requesting',
    'requirement',
    'requirements',
    'requiring',
    'researcher',
    'researchers',
    'reservation',
    'reservations',
    'reservoir',
    'residence',
    'residential',
    'residents',
    'resistance',
    'resistant',
    'resolution',
    'resolutions',
    'resources',
    'respected',
    'respective',
    'respectively',
    'respiratory',
    'responded',
    'respondent',
    'respondents',
    'responding',
    'responses',
    'responsibilities',
    'responsibility',
    'responsible',
    'restaurant',
    'restaurants',
    'restoration',
    'restricted',
    'restriction',
    'restrictions',
    'restructuring',
    'resulting',
    'retailers',
    'retention',
    'retirement',
    'retrieval',
    'retrieved',
    'returning',
    'revelation',
    'reviewing',
    'revisions',
    'revolution',
    'revolutionary',
    'richardson',
    'ringtones',
    'riverside',
    'robertson',
    'rochester',
    'roommates',
    'sacramento',
    'sacrifice',
    'salvation',
    'saskatchewan',
    'satellite',
    'satisfaction',
    'satisfactory',
    'satisfied',
    'scenarios',
    'scheduled',
    'schedules',
    'scheduling',
    'scholarship',
    'scholarships',
    'scientific',
    'scientist',
    'scientists',
    'screening',
    'screensaver',
    'screensavers',
    'screenshot',
    'screenshots',
    'scripting',
    'sculpture',
    'searching',
    'secondary',
    'secretariat',
    'secretary',
    'securities',
    'selecting',
    'selection',
    'selections',
    'selective',
    'semiconductor',
    'sensitive',
    'sensitivity',
    'sentences',
    'separated',
    'separately',
    'separation',
    'september',
    'sequences',
    'seriously',
    'settlement',
    'sexuality',
    'shakespeare',
    'shareholders',
    'shareware',
    'sheffield',
    'shipments',
    'shopzilla',
    'shortcuts',
    'showtimes',
    'signature',
    'signatures',
    'significance',
    'significant',
    'significantly',
    'similarly',
    'simplified',
    'simulation',
    'simulations',
    'simultaneously',
    'singapore',
    'situation',
    'situations',
    'slideshow',
    'smithsonian',
    'snowboard',
    'societies',
    'sociology',
    'solutions',
    'something',
    'sometimes',
    'somewhere',
    'sophisticated',
    'soundtrack',
    'southampton',
    'southeast',
    'southwest',
    'specialist',
    'specialists',
    'specialized',
    'specializing',
    'specially',
    'specialties',
    'specialty',
    'specifically',
    'specification',
    'specifications',
    'specifics',
    'specified',
    'specifies',
    'spectacular',
    'spiritual',
    'spirituality',
    'spokesman',
    'sponsored',
    'sponsorship',
    'spotlight',
    'spreading',
    'springfield',
    'squirting',
    'stability',
    'stainless',
    'stakeholders',
    'standards',
    'standings',
    'starsmerchant',
    'statement',
    'statements',
    'statewide',
    'stationery',
    'statistical',
    'statistics',
    'statutory',
    'stephanie',
    'stockholm',
    'stockings',
    'strategic',
    'strategies',
    'streaming',
    'strengthen',
    'strengthening',
    'strengths',
    'stretched',
    'structural',
    'structure',
    'structured',
    'structures',
    'subcommittee',
    'subdivision',
    'subjective',
    'sublimedirectory',
    'submission',
    'submissions',
    'submitted',
    'submitting',
    'subscribe',
    'subscriber',
    'subscribers',
    'subscription',
    'subscriptions',
    'subsection',
    'subsequent',
    'subsequently',
    'subsidiaries',
    'subsidiary',
    'substance',
    'substances',
    'substantial',
    'substantially',
    'substitute',
    'successful',
    'successfully',
    'suffering',
    'sufficient',
    'sufficiently',
    'suggested',
    'suggesting',
    'suggestion',
    'suggestions',
    'summaries',
    'sunglasses',
    'superintendent',
    'supervision',
    'supervisor',
    'supervisors',
    'supplement',
    'supplemental',
    'supplements',
    'suppliers',
    'supported',
    'supporters',
    'supporting',
    'surprised',
    'surprising',
    'surrounded',
    'surrounding',
    'surveillance',
    'survivors',
    'suspected',
    'suspended',
    'suspension',
    'sustainability',
    'sustainable',
    'sustained',
    'swaziland',
    'switching',
    'switzerland',
    'syllables',
    'symposium',
    'syndicate',
    'syndication',
    'synthesis',
    'synthetic',
    'systematic',
    'technical',
    'technician',
    'technique',
    'techniques',
    'technological',
    'technologies',
    'technology',
    'techrepublic',
    'telecharger',
    'telecommunications',
    'telephone',
    'telephony',
    'telescope',
    'television',
    'televisions',
    'temperature',
    'temperatures',
    'templates',
    'temporarily',
    'temporary',
    'tennessee',
    'terminals',
    'termination',
    'terminology',
    'territories',
    'territory',
    'terrorism',
    'terrorist',
    'terrorists',
    'testament',
    'testimonials',
    'testimony',
    'textbooks',
    'thanksgiving',
    'themselves',
    'theoretical',
    'therapeutic',
    'therapist',
    'thereafter',
    'therefore',
    'thesaurus',
    'thickness',
    'thoroughly',
    'thousands',
    'threatened',
    'threatening',
    'threshold',
    'throughout',
    'thumbnail',
    'thumbnails',
    'thumbzilla',
    'tolerance',
    'tournament',
    'tournaments',
    'trackback',
    'trackbacks',
    'trademark',
    'trademarks',
    'tradition',
    'traditional',
    'traditions',
    'transaction',
    'transactions',
    'transcript',
    'transcription',
    'transcripts',
    'transexual',
    'transexuales',
    'transferred',
    'transfers',
    'transform',
    'transformation',
    'transition',
    'translate',
    'translated',
    'translation',
    'translations',
    'translator',
    'transmission',
    'transmitted',
    'transparency',
    'transparent',
    'transport',
    'transportation',
    'transsexual',
    'travelers',
    'traveling',
    'traveller',
    'travelling',
    'treasurer',
    'treasures',
    'treatment',
    'treatments',
    'tremendous',
    'tripadvisor',
    'troubleshooting',
    'tutorials',
    'typically',
    'ultimately',
    'unauthorized',
    'unavailable',
    'uncertainty',
    'undefined',
    'undergraduate',
    'underground',
    'underline',
    'underlying',
    'understand',
    'understanding',
    'understood',
    'undertake',
    'undertaken',
    'underwear',
    'unemployment',
    'unexpected',
    'unfortunately',
    'uniprotkb',
    'universal',
    'universities',
    'university',
    'unlimited',
    'unnecessary',
    'unsubscribe',
    'upgrading',
    'utilities',
    'utilization',
    'uzbekistan',
    'vacancies',
    'vacations',
    'valentine',
    'validation',
    'valuation',
    'vancouver',
    'variables',
    'variation',
    'variations',
    'varieties',
    'vbulletin',
    'vegetable',
    'vegetables',
    'vegetarian',
    'vegetation',
    'venezuela',
    'verification',
    'verzeichnis',
    'veterinary',
    'vibrators',
    'victorian',
    'vietnamese',
    'viewpicture',
    'violation',
    'violations',
    'virtually',
    'visibility',
    'vocabulary',
    'vocational',
    'volkswagen',
    'volleyball',
    'voluntary',
    'volunteer',
    'volunteers',
    'voyeurweb',
    'vulnerability',
    'vulnerable',
    'wallpaper',
    'wallpapers',
    'warehouse',
    'warranties',
    'washington',
    'waterproof',
    'watershed',
    'webmaster',
    'webmasters',
    'wednesday',
    'wellington',
    'westminster',
    'wholesale',
    'widescreen',
    'widespread',
    'wikipedia',
    'wilderness',
    'wisconsin',
    'withdrawal',
    'witnesses',
    'wonderful',
    'wondering',
    'worcester',
    'wordpress',
    'workforce',
    'workplace',
    'workshops',
    'workstation',
    'worldwide',
    'wrestling',
    'yesterday',
    'yorkshire',
    'yugoslavia',
];

module.exports = dictionary;

},{}],7:[function(require,module,exports){
let companyNames = [
    "Mike Rowe soft",
    "Pear",
    "Outel",
    "Ice",
    "Tomsung",
    "Popsy",
    "Ohm Djezis"
];
let companies = [];

let Computer = require('./Computer');

class Company
{
    constructor(name)
    {
        this.name = name;
        this.publicServer = new Computer(`${this.name} Public Server`);
        this.computers = [];
        this.addComputer(this.publicServer);
    }

    addComputer(computer)
    {
        this.computers.push(computer);
    }

    static getRandomCompany()
    {
        return companies.randomElement();
    }

    static get allCompanies()
    {
        return companies;
    }
}

for(let companyName of companyNames)
{
    companies.push(new Company(companyName));
}

module.exports = Company;

},{"./Computer":8}],8:[function(require,module,exports){
const EventListener = require('./EventListener');

function randomIPAddress()
{
    let ipAddress = "";
    for(let i = 0; i < 3; i++)
    {
        if(i)
        {
            ipAddress += '.';
        }
        ipAddress += Math.floor(Math.random() * 256);
    }
    return ipAddress;
}

class Computer extends EventListener
{
    constructor(name, company, ipAddress)
    {
        super();
        this.name= name;
        this.ipAddress = ipAddress?ipAddress:randomIPAddress();
        this.location = null;
        this.company = company;
    }

    setLocation(location)
    {
        this.location = location;
        return this;
    }

    connect()
    {
        return this;
    }

    disconnect()
    {
        return this;
    }

    tick()
    {

    }

    static fromJSON(json)
    {
        let computer = new Computer(json.name, json.ipAddress);
        computer.setLocation(json.location);
    }

    toJSON()
    {
        let json = {
            name:this.name,
            ipAddress:this.ipAddress,
            location:this.location
        };
    }
}

module.exports = Computer;

},{"./EventListener":10}],9:[function(require,module,exports){
const   MissionGenerator = require('./Missions/MissionGenerator'),
        PlayerComputer = require('./PlayerComputer'),
        EventListener = require('./EventListener');

/**
 * This exists as an instantiable class only because it's really difficult to get static classes to have events
 */
class Downlink extends EventListener
{
    constructor()
    {
        super();
        this.playerComputer = PlayerComputer.getMyFirstComputer();
    }

    tick()
    {
        this.playerComputer.tick();
        this.activeMission.tick();
    }

    getNextMission()
    {

        this.activeMission = MissionGenerator.getFirstAvailableMission();

        for(let target of this.activeMission.hackTargets)
        {
            this.playerComputer.addTaskForChallenge(target);
        }
        return this.activeMission;
    }

    /**
     * Just exposing the currently available missions
     */
    get availableMissions()
    {
        return MissionGenerator.availableMissions;
    }

    get currentMissionTasks()
    {
        return this.playerComputer.missionTasks;
    }

}

module.exports = new Downlink();

},{"./EventListener":10,"./Missions/MissionGenerator":15,"./PlayerComputer":16}],10:[function(require,module,exports){
class Event
{
    constructor(name)
    {
        this.name = name;
        this.callbacks = [];
    }

    addListener(callback)
    {
        this.callbacks.push(callback);
        return this;
    }

    removeListener(callback)
    {
        let index = this.callbacks.indexOf(callback);
        if(index >= 0)
        {
            this.callbacks.splice(index, 1);
        }
        return this;
    }

    trigger(args)
    {
        this.callbacks.forEach(function(callback){
            callback(args);
        });
    }
}

class EventListener
{
    constructor()
    {
        /**
         * @type {{Event}}
         */
        this.events = {};
    }

    on(eventName, callback)
    {
        let e = eventName.toLowerCase();
        if(!this.events[e])
        {
            this.events[e] = new Event(e);
        }
        this.events[e].addListener(callback);
        return this;
    }

    off(eventName)
    {
        if(eventName)
        {
            let e = eventName.toLowerCase();
            this.events[e] = null;
        }
        else
        {
            this.events = {};
        }
        return this;
    }

    addListener(eventName, callback)
    {
        let e = eventName.toLowerCase();
        return this.on(e, callback);
    }

    trigger(eventName, args)
    {
        let e = eventName.toLowerCase();
        if(this.events[e])
        {
            this.events[e].trigger(args);
        }
    }


    removeListener(eventName, callback)
    {
        let e = eventName.toLowerCase();
        if(this.events[e])
        {
            this.events[e].removeListener(callback);
        }
    }
}

module.exports = EventListener;

},{}],11:[function(require,module,exports){
// namespace for the entire game;

(($)=>{$(()=>{
    const   Downlink = require('./Downlink'),
            TICK_INTERVAL_LENGTH=100,
            MISSION_LIST_CLASS = 'mission-list-row';

    let game = {
        interval:null,
        ticking:true,
        initialised:false,
        mission:false,
        /**
         * jquery entities that are needed for updating
         */
        $missionContainer:null,
        $activeMissionName:null,
        $activeMissionPassword:null,
        $activeMissionEncryptionGrid:null,
        $activeMissionEncryptionType:null,
        $activeMissionIPAddress:null,
        $activeMissionServerName:null,
        initialise:function()
        {
            if(this.initialised)
            {
                return;
            }
            this.$missionContainer = $('#mission-list');
            this.$activeMissionName = $('#active-mission');
            this.$activeMissionPassword = $('#active-mission-password-input');
            this.$activeMissionEncryptionGrid = $('#active-mission-encryption-grid');
            this.$activeMissionEncryptionType = $('#active-mission-encryption-type');
            this.$activeMissionIPAddress = $('#active-mission-server-ip-address');
            this.$activeMissionServerName = $('#active-mission-server-name');
            this.getNewMission();
            this.initialised = true;
        },
        start:function(){
            this.initialise();
            this.ticking = true;
            this.tick();
        },
        stop:function(){
            this.ticking = false;
            window.clearTimeout(this.interval);
        },
        tick:function(){
            if(this.ticking)
            {
                Downlink.tick();
                this.animateTick();
                this.interval = window.setTimeout(() => {this.tick()}, TICK_INTERVAL_LENGTH);
            }
        },
        animateTick:function()
        {
            let tasks = Downlink.currentMissionTasks;
            if(tasks.crackers.password)
            {
                this.animatePasswordField(tasks.crackers.password);
            }
            if(tasks.crackers.encryption)
            {
                this.animateEncryptionGrid(tasks.crackers.encryption);
            }
        },
        /**
         *
         * @param {PasswordCracker} passwordCracker
         */
        animatePasswordField(passwordCracker)
        {
            this.$activeMissionPassword.val(passwordCracker.currentGuess)
                .removeClass("solvedPassword unsolvedPassword")
                .addClass(passwordCracker.isSolved?"solvedPassword":"unsolvedPassword");
        },
        /**
         *
         * @param {EncryptionCracker} encryptionCracker
         */
        animateEncryptionGrid(encryptionCracker)
        {

        },
        getNewMission:function(){
            console.log("Getting mission");
            let mission = Downlink.getNextMission();
            this.updateMissionInterface(mission);
            mission.on('complete', ()=>{
                //this.getNewMission();
            });
            this.mission = mission;
        },
        /**
         *
         * @param {Mission} mission
         */
        updateMissionInterface:function(mission){
            this.updateAvailableMissionList(mission);
            this.updateCurrentMissionView(mission.computer);

        },
        updateCurrentMissionView:function(server){
            this.$activeMissionPassword.val('');
            this.$activeMissionEncryptionGrid.empty();
            this.$activeMissionEncryptionType.html(server.encryption.name);
            this.$activeMissionIPAddress.html(server.ipAddress);
            this.$activeMissionServerName.html(server.name);
        },
        updateAvailableMissionList:function(mission){
            $('.'+MISSION_LIST_CLASS).remove();
            this.$activeMissionName.html(Downlink.activeMission.name);
            let html = '';
            for(let mission of Downlink.availableMissions)
            {
                html += `<div class="row ${MISSION_LIST_CLASS}">${mission.name}</div>`;
            }
            let $html = $(html);
            this.$missionContainer.append($html);
        }
    };
    game.start();
    window.game = game;
})})(window.jQuery);

},{"./Downlink":9}],12:[function(require,module,exports){
const   Company = require('../Company'),
    MissionComputer = require('./MissionComputer'),
    Password = require('../Challenges/Password'),
    Encryption = require('../Challenges/Encryption'),
    EventListener = require('../EventListener'),
    MissionDifficulty = require('./MissionDifficulty');


/**
 * @type {{EASY: MissionDifficulty, MEDIUM: MissionDifficulty, HARD: MissionDifficulty}}
 */
const DIFFICULTIES = {
    EASY:new MissionDifficulty(1, "Server"),
    MEDIUM:new MissionDifficulty(5, "Cluster"),
    HARD:new MissionDifficulty(10, "Farm"),
};

class Mission extends EventListener
{
    /**
     * Any mission is going to involve connecting to another computer belonging to a company and doing something to it
     * @param {Company}    target      The object representing the company you are, in some way, attacking
     * @param {Company}    sponsor     The company sponsoring this hack
     */
    constructor(target, sponsor)
    {
        super();
        this.name = `Hack ${target.name} for ${sponsor.name}`;
        /**
         * @type {Company} the target company being attacked
         */
        this.target = target;
        /**
         * @type {Company} the company sponsoring this mission
         */
        this.sponsor = sponsor;

        // these values are all instantiated later.
        /**
         * @type {MissionDifficulty}
         */
        this.difficulty = null;
        /**
         *
         * @type {MissionComputer}
         */
        this.computer = null;

        this.status = "Available";
    }

    setDifficulty(difficulty)
    {
        if(!difficulty instanceof MissionDifficulty)
        {
            throw new Error("Mission Difficulty unrecognised");
        }
        this.difficulty = difficulty;
        return this;
    }

    get hackTargets()
    {
        let targets = [];
        if(this.computer.password)
        {
            targets.push(this.computer.password);
        }
        if(this.computer.encryption)
        {
            targets.push(this.computer.encryption);
        }
        return targets;
    }

    /**
     * A method to set the computer for this mission.
     * This is kept as a separate method because we only really want the mission to be populated when we take it,
     * not when we're just listing it.
     *
     *
     */
    build()
    {
        if(this.computer)
        {
            return this;
        }

        this.computer = new MissionComputer(this.target, this.difficulty.serverType);
        this.computer.on('accessed', ()=>{
            this.signalComplete();
        });

        let password = null, encryption = null;

        if(this.difficulty === DIFFICULTIES.EASY)
        {
            password = Password.randomDictionaryPassword();
            encryption = Encryption.getNewLinearEncryption();
        }

        this.computer.setPassword(password).setEncryption(encryption);


        this.target.addComputer(this.computer);
        this.status = "Underway";
        return this;
    }

    signalComplete()
    {
        this.status="Complete";

        this.trigger('complete');
    }

    tick()
    {
        this.build();
        this.computer.tick();
    }

    static getNewSimpleMission()
    {
        let companies = [...Company.allCompanies].shuffle();
        return new Mission(
            companies.shift(),
            companies.shift()
        ).setDifficulty(
            DIFFICULTIES.EASY
        );
    }
}
module.exports = Mission;

},{"../Challenges/Encryption":4,"../Challenges/Password":5,"../Company":7,"../EventListener":10,"./MissionComputer":13,"./MissionDifficulty":14}],13:[function(require,module,exports){
const   Computer = require('../Computer');
class MissionComputer extends Computer
{
    constructor(company, serverType)
    {
        let name = company.name+' '+serverType;
        super(name, company);
        this.encryption = null;
        this.password = null;
        this.accessible = false;
        this.currentPlayerConnection = null;
        this.previousPlayerConnection = null;
        this.alerted = false;

    }

    /**
     * @param {Connection} connection
     */
    connect(connection)
    {
        connection.open();
        super.connect();
        this.currentPlayerConnection = connection;

        if(this.currentPlayerConnection.equals(this.previousPlayerConnection) && this.alerted === true)
        {
            this.resumeTraceBack();
        }

        return this;
    }

    disconnect()
    {
        super.disconnect();
        this.currentPlayerConnection.close();
        this.stopTraceBack();
        return this;
    }

    setEncryption(encryption)
    {
        this.encryption = encryption;

        encryption
            .on('solved', ()=>{
                this.updateAccessStatus();
                encryption.off();
            })
            .on('start', ()=>{this.startTraceBack();});
        return this;
    }

    setPassword(password)
    {
        this.password = password;

        // password is not handled the same as encryption
        // because password is not a Tasks
        // the PasswordCracker Tasks isn't
        password.on('solved', ()=>{
            this.updateAccessStatus();
            password.off();
        }).on('start', ()=>{this.startTraceBack();});
        return this;
    }

    updateAccessStatus()
    {
        this.accessible = this.accessible || (this.encryption && this.encryption.solved && this.password && this.password.solved);
        if(this.accessible)
        {
            this.trigger('accessed');
        }
        return this.accessible;
    }

    startTraceBack()
    {

    }

    resumeTraceBack()
    {

    }

    stopTraceBack()
    {

    }
}

module.exports = MissionComputer;

},{"../Computer":8}],14:[function(require,module,exports){
/**
 * This class largely exists to make commenting cleaner
 */
class MissionDifficulty
{
    /**
     * @param {number} modifier
     * @param {string} serverType
     */
    constructor(modifier, serverType)
    {
        /**
         * @type {number}   A modifier to the reward given for the mission as a number
         */
        this.modifier = modifier;
        /**
         * @type {string}   A name for the type of server you are attacking
         */
        this.serverType = serverType;
    }
}

module.exports = MissionDifficulty;

},{}],15:[function(require,module,exports){
const   Mission = require('./Mission'),
        MINIMUM_MISSIONS = 10;
let availableMissions = [];

class MissionGenerator
{
    static updateAvailableMissions()
    {
        while(availableMissions.length < MINIMUM_MISSIONS)
        {
            availableMissions.push(
                Mission.getNewSimpleMission()
            );
        }
    }

    static get availableMissions()
    {
        this.updateAvailableMissions();
        return availableMissions;
    }

    static getFirstAvailableMission()
    {
        this.updateAvailableMissions();
        let mission = availableMissions.shift().build();
        this.updateAvailableMissions();
        return mission;
    }
}

module.exports = MissionGenerator;

},{"./Mission":12}],16:[function(require,module,exports){
const   Password = require('./Challenges/Password'),
        {DictionaryCracker, PasswordCracker} = require('./Tasks/PasswordCracker'),
        Encryption = require('./Challenges/Encryption'),
        EncryptionCracker = require('./Tasks/EncryptionCracker'),
        Computer = require('./Computer'),
        CPU = require('./CPU.js');

class InvalidTaskError extends Error{};

class PlayerComputer extends Computer
{
    constructor(cpus)
    {
        super('Home', null, '127.0.0.1');
        /**
         * @type {Array.<CPU>}
         */
        this.cpus = cpus;
        this.queuedTasks = [];
    }

    getTaskForChallenge(challenge)
    {
        let task = null;
        if(challenge instanceof Password)
        {
            task = new DictionaryCracker(challenge);
        }
        if(challenge instanceof  Encryption)
        {
            task = new EncryptionCracker(challenge);
        }
        if(!task)
        {
            throw new InvalidTaskError(`No task found for challenge ${challenge.constructor.name}`);
        }
        return task;
    }

    addTaskForChallenge(challenge)
    {
        let task = this.getTaskForChallenge(challenge),
            i= 0, searching = true, found = false;
        while(searching)
        {
            let cpu = this.cpus[i];
            try
            {
                cpu.addTask(task);
                searching = false;
                found = true;
            }
            catch(e)
            {
                console.log(e);
                i++;
                if (i == this.cpus.length)
                {
                    searching = false;
                }
            }
        }
    }

    tick()
    {
        for(let cpu of this.cpus)
        {
            cpu.tick();
        }
    }

    static getMyFirstComputer()
    {
        let potato = new PlayerComputer([
            new CPU()
        ]);
        return potato;
    }

    get tasks()
    {
        let tasks = {};
        for(let cpu of this.cpus)
        {
            for(let task of cpu.tasks)
            {
                tasks[task.name] = task;
            }
        }
        return tasks;
    }

    get missionTasks()
    {
        let allTasks = Object.values(this.tasks),
            missionTasks = {crackers:{}};
        for(let task of allTasks)
        {
            if(task instanceof PasswordCracker)
            {
                missionTasks.crackers.password = task;
            }
            if(task instanceof EncryptionCracker)
            {
                missionTasks.crackers.encryption = task;
            }
        }
        return missionTasks;

    }
}

module.exports = PlayerComputer;

},{"./CPU.js":2,"./Challenges/Encryption":4,"./Challenges/Password":5,"./Computer":8,"./Tasks/EncryptionCracker":17,"./Tasks/PasswordCracker":18}],17:[function(require,module,exports){
const   Alphabet = require('../Alphabet'),
    Task = require('./Task');

class EncryptionCell
{
    constructor()
    {
        this.solved = false;
        this.letter = Alphabet.getRandomLetter();
    }

    solve()
    {
        this.solved = true;
        this.letter = '0';
    }

    tick()
    {
        if(this.solved)
        {
            return;
        }
        this.letter = Alphabet.getRandomLetter();
    }
}

class EncryptionCracker extends Task
{
    constructor(encryption)
    {
        super('EncryptionCracker', encryption, encryption.difficulty);
        this.rows = encryption.rows;
        this.cols = encryption.cols;
        this.encryption = encryption;

        /**
         * This is just an arbitrary number representing how many clock cycles per tick are needed to solve each cell
         */
        this.encryptionDifficulty = encryption.difficulty;

        /**
         *
         * @type {number}
         */
        this.cyclesPerTick = 0;
        /**
         * The amount of progress you have made on the current tick
         */
        this.currentTickPercentage = 0;

        this.grid = [];
        this.cells = [];
        this.unsolvedCells = [];
        for(let i = 0; i < this.rows; i++)
        {
            let row = [];
            this.grid.push(row);

            for(let j = 0; j < this.cols; j++)
            {
                let cell = new EncryptionCell();
                row[j] = cell;
                this.cells.push(cell);
                this.unsolvedCells.push(cell);
            }
        }
    }


    solveNCells(cellsToSolve)
    {
        this.trigger('start');

        for(let i = 0; i < cellsToSolve; i++)
        {
            let cell = this.unsolvedCells.randomElement();
            if(cell)
            {
                cell.solve();
                this.unsolvedCells.removeElement(cell);
            }
        }
        if(!this.unsolvedCells.length)
        {
            this.signalComplete();
        }
    }

    signalComplete()
    {
        super.signalComplete();
    }

    get percentage()
    {
        return (this.cells.length - this.unsolvedCells.length) / (this.cells.length);
    }

    get solved()
    {
        return this.unsolvedCells.length == 0;
    }

    tick()
    {
        super.tick();

        // Cycle through all of the cells and tick them.
        for (let cell of this.unsolvedCells)
        {
            cell.tick();
        }

        // figure out how many cells to solve
        // by determining how many cycles per tick we have divided by the difficulty of this task
        // this may lead to a number less than zero and so, this tick, nothing will happen

        this.currentTickPercentage += this.cyclesPerTick / this.encryptionDifficulty;

        // if the currentTickPercentage is bigger than one, we solve that many cells
        if(this.currentTickPercentage >= 1)
        {
            let fullCells = parseInt(this.currentTickPercentage);
            this.currentTickPercentage -= fullCells;
            this.solveNCells(fullCells);
        }
    }

    static fromJSON(json)
    {
        json = json?json:{rows:10,cols:10,difficulty:50};
        return new EncryptionCracker(json.rows, json.cols, json.difficulty);
    }

    getRewardRatio()
    {
        return this.difficultyRatio / Math.pow(this.ticksTaken, 2);
    }
}

module.exports = EncryptionCracker;

},{"../Alphabet":1,"./Task":19}],18:[function(require,module,exports){
const   DICTIONARY_CRACKER_MINIMUM_CYCLES = 5,
        SEQUENTIAL_CRACKER_MINIMUM_CYCLES = 20,
        Task = require('./Task'),
        Password = require('../Challenges/Password');

class PasswordCracker extends Task
{
    constructor(password, name, minimumRequiredCycles)
    {
        super(name, password, minimumRequiredCycles);
        this.password = password.on('solved', ()=>{this.signalComplete()});
        this.currentGuess = null;
    }

    attackPassword()
    {
        let result = this.password.attack(this.currentGuess);
        if(result)
        {
            this.signalComplete();
        }
        return result;
    }

}


class DictionaryCracker extends PasswordCracker
{
    constructor(password)
    {
        console.log("Building password cracker");
        console.log(password);
        super(password, 'Dictionary Cracker', DICTIONARY_CRACKER_MINIMUM_CYCLES);
        this.dictionary = [...Password.dictionary];
        this.totalGuesses = 0;
    }

    get dictionaryEntriesLeft()
    {
        return this.dictionary.length;
    }

    tick()
    {
        super.tick();

        if(!this.solved)
        {
            let attacking = true,
                found = false,
                guessesThisTick = 0;

            while(attacking)
            {
                this.currentGuess = this.dictionary[this.totalGuesses++];

                let guessSuccessful = this.attackPassword();
                found = found || guessSuccessful;
                if(guessSuccessful || guessesThisTick++ >= this.cyclesPerTick)
                {
                    attacking = false;
                }
            }
        }
    }
}

class SequentialAttacker extends PasswordCracker
{
    constructor(password)
    {
        super(password, 'Sequential Cracker', SEQUENTIAL_CRACKER_MINIMUM_CYCLES);
    }

    tick()
    {

    }
}

module.exports = {
    PasswordCracker:PasswordCracker,
    DictionaryCracker:DictionaryCracker,
    SequentialAttacker:SequentialAttacker
};

},{"../Challenges/Password":5,"./Task":19}],19:[function(require,module,exports){
const EventListener = require('../EventListener');

class Task extends EventListener
{
    constructor(name, challenge, minimumRequiredCycles)
    {
        super();
        this.name= name;
        this.minimumRequiredCycles = minimumRequiredCycles?minimumRequiredCycles:10;
        this.cyclesPerTick = 0;
        this.weight = 1;
        this.difficultyRatio = 0;
        this.ticksTaken = 0;
        this.working = false;
        this.taskCompleted = false;
        this.challenge = challenge;
    }

    setCyclesPerTick(cyclesPerTick)
    {
        if(cyclesPerTick < this.minimumRequiredCycles)
        {
            throw new Error("Trying to run a task with fewer cycles than it requires");
        }
        this.cyclesPerTick = cyclesPerTick;
        return this;
    }

    addCycles(tickIncrease)
    {
        this.cyclesPerTick += tickIncrease;
    }

    /**
     * Try to release a number of ticks from the task and return the number actually released
     * @param tickReduction
     * @returns {number|*}
     */
    freeCycles(tickReduction)
    {
        if(this.cyclesPerTick <= (tickReduction + this.minimumRequiredCycles))
        {

            if(this.cyclesPerTick > 1)
            {
                let halfMyCyclesRoundedDown = Math.floor(this.cyclesPerTick / 2);
                this.cyclesPerTick -= halfMyCyclesRoundedDown;
                return halfMyCyclesRoundedDown;
            }
            return 0;
        }
        this.cyclesPerTick -= tickReduction;
        return tickReduction;
    }

    signalComplete()
    {
        this.working = false;
        this.taskCompleted = true;
        this.challenge.solve();
        this.trigger('complete');
    }

    getRewardRatio()
    {
        return 0;
        //return this.difficultyRatio / Math.pow(this.ticksTaken, 2.5);
    }

    tick()
    {
        this.ticksTaken++;
    }
}

module.exports = Task;

},{"../EventListener":10}]},{},[11]);
