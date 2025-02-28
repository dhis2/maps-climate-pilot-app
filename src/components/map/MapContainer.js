import PropTypes from 'prop-types'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setAggregations } from '../../actions/aggregations.js'
import { openContextMenu, closeCoordinatePopup } from '../../actions/map.js'
import useBasemapConfig from '../../hooks/useBasemapConfig.js'
import MapLoadingMask from './MapLoadingMask.js'
import MapName from './MapName.js'
import MapView from './MapView.js'

const MapContainer = ({ resizeCount, setMap }) => {
    const { basemap, newLayerIsLoading, coordinatePopup, mapViews, bounds } =
        useSelector((state) => state.map)
    const interpretationModalOpen = useSelector(
        (state) => !!state.interpretation.id
    )
    const feature = useSelector((state) => state.feature)
    const basemapConfig = useBasemapConfig(basemap)
    const dispatch = useDispatch()

    const layers = mapViews.filter((layer) => layer.isLoaded)
    const isLoading = newLayerIsLoading || layers.length !== mapViews.length

    return (
        <>
            <MapName />
            <MapView
                isPlugin={false}
                basemap={basemapConfig}
                layers={layers}
                bounds={bounds}
                feature={feature}
                openContextMenu={(config) => dispatch(openContextMenu(config))}
                coordinatePopup={coordinatePopup}
                interpretationModalOpen={interpretationModalOpen}
                closeCoordinatePopup={() => dispatch(closeCoordinatePopup())}
                setAggregations={(data) => dispatch(setAggregations(data))}
                resizeCount={resizeCount}
                setMapObject={setMap}
            />
            {isLoading && <MapLoadingMask />}
        </>
    )
}

MapContainer.propTypes = {
    resizeCount: PropTypes.number.isRequired,
    setMap: PropTypes.func.isRequired,
}

export default MapContainer
