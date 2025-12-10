import TestFunctions from './pages/TestFunctions';
import DashboardComponents from './pages/DashboardComponents';
import Home from './pages/Home';
import SearchPods from './pages/SearchPods';
import Settings from './pages/Settings';
import Template from './pages/Template';
import ResumeBuilder from './pages/ResumeBuilder';
import SearchResults from './pages/SearchResults';
import Markets from './pages/Markets';
import Learning from './pages/Learning';
import Intelligence from './pages/Intelligence';
import Notes from './pages/Notes';
import Comms from './pages/Comms';
import Games from './pages/Games';
import Geospatial from './pages/Geospatial';
import Tasks from './pages/Tasks';
import MindMap from './pages/MindMap';
import Qwirey from './pages/Qwirey';
import Search from './pages/Search';
import TermsOfUse from './pages/TermsOfUse';
import ContactUs from './pages/ContactUs';
import News from './pages/News';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import __Layout from './Layout.jsx';


export const PAGES = {
    "TestFunctions": TestFunctions,
    "DashboardComponents": DashboardComponents,
    "Home": Home,
    "SearchPods": SearchPods,
    "Settings": Settings,
    "Template": Template,
    "ResumeBuilder": ResumeBuilder,
    "SearchResults": SearchResults,
    "Markets": Markets,
    "Learning": Learning,
    "Intelligence": Intelligence,
    "Notes": Notes,
    "Comms": Comms,
    "Games": Games,
    "Geospatial": Geospatial,
    "Tasks": Tasks,
    "MindMap": MindMap,
    "Qwirey": Qwirey,
    "Search": Search,
    "TermsOfUse": TermsOfUse,
    "ContactUs": ContactUs,
    "News": News,
    "NotFound": NotFound,
    "Privacy": Privacy,
}

export const pagesConfig = {
    mainPage: "SearchPods",
    Pages: PAGES,
    Layout: __Layout,
};