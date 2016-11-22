/**
* @author massi
*/
import '../../../styles/timeline.scss';
import React from 'react';
import { isElementInViewport } from '../../utils/helper-funcs';
import timelineData from '../../../data/timeline.json';


class TimelineContainer extends React.Component {

    constructor() {
        super();
        this.toggleTimelineElements = this.toggleTimelineElements.bind(this);
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

        const timeline = timelineData, eventList = [];
        let counter = 0;

        for (const event of timeline.data) {
            const {time, title, text = '', images = [], links = []} = event, imgs = [], as = [];

            // Add images
            for (const image of images) {
                const src = image.src || image;
                imgs.push(<br />);
                imgs.push(<img key={src} src={src} width={image.width} height={image.height} alt={ image.alt || 'Event Image'} />);
            }

            // Add links
            for (const link of links) {
                as.push(<br />);
                as.push(<a href={link.href || link} target="_blank" rel="noopener noreferrer">{link.label || link}</a>);
            }

            eventList.push(<li key={`time-el-${counter}`} ref={counter}>
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

        return <div className="bs-timeline-cnt">
            <section className="intro">
                <div className="bs-timeline-header-cnt">
                    <h1>BioSharing Timeline &darr;</h1>
                </div>
            </section>
            <section className='bs-timeline'>
                <ul>
                    {eventList}
                </ul>
            </section>
        </div>;
    }

}

export default TimelineContainer;
