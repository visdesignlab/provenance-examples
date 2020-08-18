import { Provenance, ProvenanceNode, ProvenanceGraph, StateNode } from '@visdesignlab/trrack';
import React, { ReactChild, useRef } from 'react';
import { Animate } from 'react-move';
import { Popup } from 'semantic-ui-react';
import ContentEditable from 'react-contenteditable'

import { BundleMap } from '../Utils/BundleMap';
import { EventConfig } from '../Utils/EventConfig';
import translate from '../Utils/translate';
import { treeColor } from './Styles';

interface BackboneNodeProps<T, S extends string, A> {
  prov: Provenance<T, S, A>;
  first: boolean;
  iconOnly: boolean;
  current: boolean;
  duration: number;
  node: StateNode<T, S, A>;
  radius: number;
  strokeWidth: number;
  textSize: number;
  setBookmark: any;
  bookmark: string[];
  nodeMap: any;
  annotationOpen: number;
  setAnnotationOpen: any;
  exemptList: string[];
  setExemptList: any;
  bundleMap?: BundleMap;
  clusterLabels: boolean;
  editAnnotations: boolean;
  eventConfig?: EventConfig<S>;
  popupContent?: (nodeId: StateNode<T, S, A>) => ReactChild;
  annotationContent?: (nodeId: StateNode<T, S, A>) => ReactChild;
  expandedClusterList?: string[];
}

function BackboneNode<T, S extends string, A>({
  prov,
  first,
  iconOnly,
  current,
  node,
  duration,
  radius,
  strokeWidth,
  textSize,
  nodeMap,
  annotationOpen,
  setBookmark,
  bookmark,
  setAnnotationOpen,
  exemptList,
  setExemptList,
  bundleMap,
  clusterLabels,
  eventConfig,
  popupContent,
  editAnnotations,
  annotationContent,
  expandedClusterList,
}: BackboneNodeProps<T, S, A>) {
  const padding = 15;

  let cursorStyle = {
    cursor: "pointer",
  } as React.CSSProperties;

  const annotateText = useRef('Edit Annotation');

  const handleChange = evt => {
      prov.addAnnotationToNode(node.id, evt.target.value);
      annotateText.current = evt.target.value;
      console.log(prov.graph().nodes[node.id])
  };

  // console.log(JSON.parse(JSON.stringify(node)));
  let glyph = (
    <circle
      style={cursorStyle}
      className={treeColor(current)}
      r={radius}
      strokeWidth={strokeWidth}
    />
  );


  // let backboneBundleNodes = findBackboneBundleNodes(nodeMap, bundleMap)

  let dropDownAdded = false;

  if (eventConfig) {
    const eventType = node.metadata.type;
    if (eventType && eventType in eventConfig && eventType !== "Root") {
      const { bundleGlyph, currentGlyph, backboneGlyph } = eventConfig[
        eventType
      ];
      if (bundleMap && Object.keys(bundleMap).includes(node.id)) {
        dropDownAdded = true;
        glyph = (
          <g style={cursorStyle} fontWeight={"none"}>
            {bundleGlyph}
          </g>
        );
      }
      if (current) {
        glyph = (
          <g style={cursorStyle} fontWeight={"none"}>
            {currentGlyph}
          </g>
        );
      } else if (!dropDownAdded) {
        glyph = (
          <g style={cursorStyle} fontWeight={"none"}>
            {backboneGlyph}
          </g>
        );
      }
    }
  }

  let label: string = "";
  let annotate: string = "";

  //console.log(bundleMap)
  //console.log(nodeMap[node.id]);

  if (bundleMap && Object.keys(bundleMap).includes(node.id) && node.ephemeral && expandedClusterList && !expandedClusterList.includes(node.id))
  {
    if(node.metadata && node.metadata.type)
    {
      label = "[" + bundleMap[node.id].bunchedNodes.length + "] " + node.metadata.type
    }
    else{
      label = "[" + bundleMap[node.id].bunchedNodes.length + "]"
    }
  }
  else{
    label = node.label;
  }

  if (node.artifacts && node.artifacts.annotation && node.artifacts.annotation.length > 0) {
    annotate = node.artifacts.annotation;
  }

  let showHtml = (
    <text
      y={7}
      x={dropDownAdded ? 10 : 0}
      dominantBaseline="middle"
      textAnchor="start"
      fontSize={textSize}
      fontWeight={"regular"}
      onClick={() => labelClicked(node)}
      >
      hello
    </text>
  )


  if (!nodeMap[node.id]) {
    return null;
  }

  if (annotate.length > 20) annotate = annotate.substr(0, 20) + "..";

  if (label.length > 20) label = label.substr(0, 20) + "..";

  let labelG = (
    <g style={{ opacity: 1 }} transform={translate(padding, 0)}>
      {!iconOnly ? (
        <g>
          {dropDownAdded ? (
            <text
              style={cursorStyle}
              onClick={(e) => nodeClicked(node, e)}
              fontSize={17}
              fill={"rgb(248, 191, 132)"}
              textAnchor="middle"
              alignmentBaseline="middle"
              x={1}
              y={0}
              fontFamily="FontAwesome"
            >
              {expandedClusterList && expandedClusterList.includes(node.id)
                ? "\uf0d8"
                : "\uf0d7"}
            </text>
          ) : (
            <g></g>
          )}
          {editAnnotations ? (
            <button
             ><i className="fas fa-undo marginRight"></i>
               Undo</button>
          ) : (
            <g></g>
          )}
          <text
            y={annotate.length === 0 ? 0 : -7}
            x={dropDownAdded ? 10 : 0}
            dominantBaseline="middle"
            textAnchor="start"
            fontSize={textSize}
            fontWeight={"bold"}
            onClick={() => labelClicked(node)}
          >
            {label}
          </text>
          ,
          <text
            y={7}
            x={dropDownAdded ? 10 : 0}
            dominantBaseline="middle"
            textAnchor="start"
            fontSize={textSize}
            fontWeight={"regular"}
            onClick={() => labelClicked(node)}
          >
            {annotate}
          </text>
          ,
          <text
            style={cursorStyle}
            onClick={(e) => {
              prov.setBookmark(node.id, !prov.getBookmark(node.id));

              e.stopPropagation();
            }}
            fontSize={17}
            className="fas fa"
            opacity={bookmark.includes(node.id) || prov.getBookmark(node.id) ? 1 : 0}
            fill={prov.getBookmark(node.id) ? "#2185d0" : "#cccccc"}
            textAnchor="middle"
            alignmentBaseline="middle"
            x={175}
            y={0}
            fontFamily="FontAwesome"
          >
            {"\uf02e"}
          </text>,
          <text
            style={cursorStyle}
            onClick={(e) => {
              if(annotationOpen === -1 || nodeMap[node.id].depth != annotationOpen)
              {
                setAnnotationOpen(nodeMap[node.id].depth);
              }
              else{
                setAnnotationOpen(-1);
              }
            }}
            fontSize={17}
            className="fas fa-edit"
            opacity={bookmark.includes(node.id) || annotationOpen === nodeMap[node.id].depth ? 1 : 0}
            fill={annotationOpen === nodeMap[node.id].depth ? "#2185d0" : "#cccccc"}
            textAnchor="middle"
            alignmentBaseline="middle"
            x={210}
            y={0}
            fontFamily="FontAwesome"
          >
            {"\uf044"}
          </text>
        </g>
      ) : (
        <g>
          {dropDownAdded ? (
            <text
              style={cursorStyle}
              onClick={(e) => nodeClicked(node, e)}
              fontSize={17}
              fill={"rgb(248, 191, 132)"}
              textAnchor="middle"
              alignmentBaseline="middle"
              x={1}
              y={0}
              fontFamily="FontAwesome"
            >
              {expandedClusterList && expandedClusterList.includes(node.id)
                ? "\uf0d8"
                : "\uf0d7"}
            </text>
          ) : (
            <g></g>
          )}
        </g>
      )}
    </g>
  );

  return (
    <Animate
      start={{ opacity: 0 }}
      enter={{
        opacity: [1],
        timing: { duration: 100, delay: first ? 0 : duration },
      }}
    >
      {(state) => (
        <>
          {popupContent !== undefined && nodeMap[node.id].depth > 0 ? (
            <Popup content={popupContent(node)} trigger={glyph} />
          ) : (
            glyph
          )}
          {/* {glyph} */}

          {popupContent !== undefined && nodeMap[node.id].depth > 0 ? (
            <Popup content={popupContent(node)} trigger={labelG} />
          ) : (
            labelG
          )}

          {annotationOpen !== -1 &&
          nodeMap[node.id].depth === annotationOpen ? (
            <g
              transform="translate(15, 25)"
              >
              <foreignObject width="200" height="400">
                <ContentEditable
                    html={annotateText.current} // innerHTML of the editable div
                    onChange={handleChange}
                    disabled={false}
                  />
              </foreignObject>
            </g>
          ) : (
            <g></g>
          )}
        </>
      )}
    </Animate>
  );

  function labelClicked(node: ProvenanceNode<T, S, A>) {
    if (!annotationContent) {
      return;
    } else if (annotationOpen === nodeMap[node.id].depth) {
      setAnnotationOpen(-1);
    } else {
      setAnnotationOpen(nodeMap[node.id].depth);
    }
  }

  function nodeClicked(node: ProvenanceNode<T, S, A>, event: any) {
    if (bundleMap && Object.keys(bundleMap).includes(node.id)) {
      let exemptCopy: string[] = Array.from(exemptList);

      if (exemptCopy.includes(node.id)) {
        exemptCopy.splice(
          exemptCopy.findIndex((d) => d === node.id),
          1
        );
      } else {
        exemptCopy.push(node.id);
      }

      setExemptList(exemptCopy);
    }

    event.stopPropagation();
  }
}

export default BackboneNode;

// const Label: FC<{ label: string } & React.SVGProps<SVGTextElement>> = (props: {
//   label: string;
// }) => {
//   return <text {...props}>{props.label}</text>;
// };
