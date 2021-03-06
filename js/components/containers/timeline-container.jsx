/**
* @author massi
*/
import '../../../styles/timeline.scss';
import React from 'react';
import { isElementInViewport } from '../../utils/helper-funcs';
import timelineData from '../../../data/timeline.json';

const ELEM_DIV_ID_PREFIX = 'time-el-div-';

/**
 * @class
 * @name HorizontalTimeline
 * @extends React.Component
 */
export class HorizontalTimeline extends React.Component {

    static propTypes = {
        events: React.PropTypes.array.isRequired
    }

    constructor() {
        super();
        this._buildEventList = this._buildEventList.bind(this);
    }

    render() {
        const eventList = this._buildEventList();
        return <section className='horizontal-timeline'>
            <div className='bar' />
            <hr className='dashed-bar' />
            <ul>
                {eventList}
            </ul>
        </section>;
    }

    /**
     * @method
     * @name
     * @private
     * @description bulds an array of <li> elements; each element is an entity in the timeline
     * @param{Array} events
     * @return Array
     */
    _buildEventList() {
        const { events } = this.props, eventList = [];
        let counter = events.length;
        for (const event of events) {
            counter--;
            const { time, synopsis } = event;
            if (synopsis) {
                eventList.push(<li>
                    <div>
                        <b>
                            <time dateTime={time.datetime}>{time.display}</time>
                            {' - '}
                        </b>
                        <a href={`#${ELEM_DIV_ID_PREFIX}${counter}`}>{` ${synopsis}`}</a>
                    </div>
                </li>);
            }
        }
        return eventList;
    }

}

/**
 * @class
 * @name VerticalTimeline
 * @extends React.Component
 * @prop{Array} events
 */
export class VerticalTimeline extends React.Component {

    constructor() {
        super();
        this.toggleTimelineElements = this.toggleTimelineElements.bind(this);
        this._buildEventList = this._buildEventList.bind(this);
    }

    /**
     * @method
     * @name toggleTimelineElements
     * @description adds the 'in-view' class to elements that are in the viewport
     */
    toggleTimelineElements() {
        for (const ref of Object.keys(this.refs)) {
            const listElem = this.refs[ref];
            if (isElementInViewport(listElem)) {
                listElem.classList.add('in-view');
            }
        }
    }

    componentDidMount() {
        this.toggleTimelineElements();
        window.addEventListener('scroll', this.toggleTimelineElements);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.toggleTimelineElements);
    }

    componentDidUpdate() {
        this.toggleTimelineElements();
    }

    render() {
        const eventList = this._buildEventList();
        return <section className='vertical-timeline'>
            <ul>
                {eventList}
            </ul>
        </section>;
    }

    /**
     * @method
     * @name
     * @private
     * @description bulds an array of <li> elements; each element is an entity in the timeline
     * @param{Array} events
     * @return Array
     */
    _buildEventList() {
        const { events } = this.props, eventList = [];
        let counter = 0;

        for (const event of events) {
            const {time, title, text = '', images = [], links = []} = event, imgs = [], as = [];

            // Add images
            for (const image of images) {
                const src = image.src || image;
                imgs.push(<br key={`br-${src}`} />);
                imgs.push(<img key={src} src={src} width={image.width} height={image.height} alt={ image.alt || 'Event Image'} />);
            }

            // Add links
            for (const link of links) {
                const href = link.href || link;
                as.push(<br key={`br-${href}`} />);
                as.push(<a key={href} href={href} target="_blank" rel="noopener noreferrer">{link.label || link}</a>);
            }

            eventList.push(<li key={`time-el-${counter}`} ref={counter}>
                <span id={`${ELEM_DIV_ID_PREFIX}${counter}`} className='anchor' />
                <div>
                    <time dateTime={time.datetime}>{time.display}</time>
                    <b>{`${title} - `}</b>
                    {text}
                    {as}
                    {imgs}
                </div>
            </li>);
            counter++;
        }
        return eventList;
    }

}

/**
 * @class
 * @name TimelineContainer
 * @description container class for the Timelines. It contains a horizontal timeline with summaries
 *              and a vertical timeline with all the details
 */
class TimelineContainer extends React.Component {

    static propTypes = {
        timelineElements: React.PropTypes.array.isRequired
    }

    static defaultProps = {
        timelineElements: timelineData.elements
    }

    render() {
        const { timelineElements } = this.props;
        return <div className="bs-timeline-cnt">
            <section className="bs-horizontal-timeline-header-section">
                <div className="bs-timeline-header-cnt">
                    <h3>Key Milestones</h3>
                </div>
            </section>
            <HorizontalTimeline events={[].concat(timelineElements).reverse()} />
            <section className="bs-timeline-header-section">
                <div className="bs-timeline-header-cnt">
                    <h1>FAIRsharing Timeline &darr;</h1>
                </div>
            </section>
            <VerticalTimeline events={timelineElements}/>
        </div>;
    }

}

export default TimelineContainer;
