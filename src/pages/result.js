import React from "react";
import { trim, prop, map, isEmpty, sortBy, flow } from "lodash/fp";
import QueryString from "query-string";
import { navigate } from "@reach/router";
import { Tabs, DragTabList, DragTab, PanelList, Panel } from "react-tabtab";
import { simpleSwitch } from "react-tabtab/lib/helpers/move";
import axios from 'axios';

import {
  compose,
  setDisplayName,
  withHandlers,
  lifecycle,
  withState,
  withProps
} from "recompose";
import "./lib.css";
import { get } from "../../shared/request";
import style from "./style.module.less";

import Header from "../components/header";


export default compose(
  setDisplayName(__filename),
  withState("activeIndex", "setActiveIndex", 0),
  withState("tabs", "setTabs", []),
  withState("result", "setResult", []),
  withState("keyword", "setKeyword", ""),
  withState("searching", "setSearching", false),
  withState("height", "setHeight", 420),
  withHandlers({
    onResize: ({ setHeight }) => () => {
      var height =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
      setHeight(height - 148);
    }
  }),
  lifecycle({
    componentDidMount() {
      const search = prop("location.hash")(this.props);
      const { setKeyword, setSearching, setHeight } = this.props;
      const keywords = QueryString.parse(search);
      setSearching(true);
      setKeyword(keywords.q);
      this.props.onResize();
      window.onresize = this.props.onResize;
    }
  }),
  withHandlers({
    onSearch: ({ setResult, setKeyword, setSearching }) => value => {
      const q = trim(value);
      setKeyword(q);
      window.location.hash = `#q=${q}`;
      if (!isEmpty(q)) {
        setSearching(true);
        axios.get(`http://localhost:3066/search?type=content&q=${q}`)
          .then(({ data }) => {
            console.log(data);
            setSearching(false);
            setResult(data);
          })
          .catch((e) => {
            console.log(e);
            setSearching(false);
            setResult([]);
          });
      } else {
        navigate(`/`);
      }
    },
    onView: () => title => () => {
      if (_hmt) {
        _hmt.push(["_trackEvent", "课程", "查看", title, 1]);
      }
    },
    handleTabSequenceChange: ({ setActiveIndex, tabs, setTabs }) => ({
      oldIndex,
      newIndex
    }) => {
      setActiveIndex(newIndex);
      setTabs(simpleSwitch(tabs, oldIndex, newIndex));
    }
  }),
  withProps(({ reslut }) => {
    return {
      reslut: flow(
        sortBy(item => {
          let hot = prop("hot")(item);
          return -hot;
        })
      )(reslut)
    };
  })
)(
  ({
    activeIndex,
    onSearch,
    keyword,
    setKeyword,
    searching,
    height,
    onView,
    setActiveIndex,
    handleTabSequenceChange,
    tabs
  }) => (
    <div>
      <div className={style.Header}>
        <Header onSearch={onSearch} keyword={keyword} setKeyword={setKeyword} />
      </div>
      <div className={style.Content} style={{ minHeight: height || 420 }}>
        <Tabs
          activeIndex={activeIndex}
          onTabChange={setActiveIndex}
          onTabSequenceChange={handleTabSequenceChange}
        >
          <DragTabList>
            <DragTab>多吉</DragTab>
            <DragTab>百度</DragTab>
            <DragTab>Github</DragTab>
            <DragTab>知乎</DragTab>
            <DragTab>微信</DragTab>
          </DragTabList>
          <PanelList>
            <Panel>
              <iframe
                title="多吉"
                src={`https://dogedoge.com/results?q=${keyword}`}
                width="100%"
                height="800"
                frameborder="0"
              />
            </Panel>
            <Panel>
              <iframe
                title="百度"
                src={`https://www.baidu.com/s?wd=${keyword}`}
                width="100%"
                height="800"
                frameborder="0"
              />
            </Panel>
            <Panel>
            <iframe
              title="Github"
              src={`https://github.com/search?q=${keyword}`}
              width="100%"
              height="800"
             
              frameframeborder="0"
            />
          </Panel>
            <Panel>
              <iframe
                title="知乎"
                src={`https://www.zhihu.com/search?type=content&q=${keyword}`}
                width="100%"
                height="800"
                is="x-frame-bypass" 
                frameframeborder="0"
              />
            </Panel>
            <Panel>
              <iframe
                title="微信"
                src={`https://weixin.sogou.com/weixin?p=01030402&query=${keyword}&type=2&ie=utf8`}
                width="100%"
                height="800"
                is="x-frame-bypass" 
                frameborder="0"
              />
            </Panel>
          </PanelList>
        </Tabs>
      </div>
      <footer className={style.Footer}>
        © 2019 Research Created by Andy | 蜀ICP备18015889号-1
      </footer>
    </div>
  )
);
