import {Inject, Injectable} from '@nestjs/common';
import {Client} from '@googlemaps/google-maps-services-js';
import {LatLng} from '@googlemaps/google-maps-services-js/dist';
import {DistanceMatrixResponse} from '@googlemaps/google-maps-services-js/dist/distance';
import {EstimationsInterface} from "./interfaces/googleMaps.interface";

@Injectable()
export class GoogleMapsHelper {
  constructor(
    @Inject('GoogleMapsClient')
    private readonly googleMapsClient: Client,
    @Inject('GoogleMapsKey')
    private readonly key: string,
  ) {
  }

  async getDistanceMatrix(destinations: LatLng[], origins: LatLng[]): Promise<DistanceMatrixResponse> {
    try {
      console.log("getDistanceMatrix", JSON.stringify(destinations))

      const distanceMatrices: DistanceMatrixResponse = await this.googleMapsClient.distancematrix({
        params: {
          origins,
          destinations,
          key: this.key
        },
      });
      return distanceMatrices;
    } catch (e) {
      console.error(e)
    }
  }

  async singleOriginEstimationsArray(destinations: LatLng[], origin: LatLng): Promise<EstimationsInterface[]> {
    const distanceMatrixResponse: DistanceMatrixResponse = await this.getDistanceMatrix(destinations, [origin])
    let estimations: EstimationsInterface[]
    if (distanceMatrixResponse.data.rows.length > 0) {
      estimations = distanceMatrixResponse.data.rows[0].elements.map(element => {
        let distance = "inf"
        let duration = "inf"
        let durationValue = 9999
        if (element.status == "OK") {
          distance = element.distance.text
          duration = element.duration.text
          durationValue = element.duration.value
        }
        return {distance, duration, durationValue}
      })
    } else {
      console.log('Google Maps API did not respond')
    }
    return estimations
  }
}