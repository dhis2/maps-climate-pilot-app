import { useCachedDataQuery } from '@dhis2/analytics'
import { useDataEngine } from '@dhis2/app-runtime'
import log from 'loglevel'
import { useRef, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setAnalyticalObject } from '../../actions/analyticalObject.js'
import { setDownloadMode } from '../../actions/download.js'
import { setInterpretation } from '../../actions/interpretations.js'
import { newMap, setMap } from '../../actions/map.js'
import { getFallbackBasemap } from '../../constants/basemaps.js'
import { CURRENT_AO_KEY } from '../../util/analyticalObject.js'
import { dataStatisticsMutation } from '../../util/apiDataStatistics.js'
import { addOrgUnitPaths } from '../../util/helpers.js'
import history, {
    getHashUrlParams,
    defaultHashUrlParams,
} from '../../util/history.js'
import { fetchMap } from '../../util/requests.js'

export const useLoadMap = () => {
    const previousParamsRef = useRef(defaultHashUrlParams)
    const { systemSettings, basemaps } = useCachedDataQuery()
    const defaultBasemap = systemSettings.keyDefaultBaseMap
    const engine = useDataEngine()
    const dispatch = useDispatch()

    const loadMap = useCallback(
        async (hashLocation) => {
            previousParamsRef.current = getHashUrlParams(hashLocation)

            if (hashLocation.pathname === '/') {
                dispatch(newMap())
                return
            }

            const { mapId, isDownload, interpretationId } =
                previousParamsRef.current

            if (mapId === CURRENT_AO_KEY) {
                dispatch(newMap())
                dispatch(setAnalyticalObject(true))
                if (isDownload) {
                    dispatch(setDownloadMode(true))
                }
                return
            }

            try {
                const map = await fetchMap(mapId, engine, defaultBasemap)

                engine.mutate(dataStatisticsMutation, {
                    variables: { id: mapId },
                    onError: (error) => log.error('Error: ', error),
                })

                const basemapConfig =
                    basemaps.find(({ id }) => id === map.basemap.id) ||
                    basemaps.find(({ id }) => id === defaultBasemap) ||
                    getFallbackBasemap()

                dispatch(
                    setMap({
                        ...map,
                        mapViews: addOrgUnitPaths(map.mapViews),
                        basemap: { ...map.basemap, ...basemapConfig },
                    })
                )

                if (interpretationId) {
                    dispatch(setInterpretation(interpretationId))
                } else if (isDownload) {
                    dispatch(setDownloadMode(true))
                }
            } catch (e) {
                log.error(e)
                dispatch(newMap())
            }
        },
        [basemaps, defaultBasemap, dispatch, engine]
    )

    useEffect(() => {
        loadMap(history.location)
    }, [loadMap])

    useEffect(() => {
        const unlisten = history.listen(({ action, location }) => {
            const {
                mapId: prevMapId,
                interpretationId: prevInterpretationId,
                isDownload: prevIsDownload,
            } = previousParamsRef.current

            const { mapId, interpretationId, isDownload } =
                getHashUrlParams(location)

            if (action === 'REPLACE' || prevMapId !== mapId) {
                loadMap(location)
                return
            }

            if (isDownload !== prevIsDownload) {
                dispatch(setDownloadMode(isDownload))
                previousParamsRef.current.isDownload = isDownload
            } else if (interpretationId !== prevInterpretationId) {
                dispatch(setInterpretation(interpretationId))
                previousParamsRef.current.interpretationId = interpretationId
            }
        })

        return () => unlisten && unlisten()
    }, [loadMap, dispatch])
}
